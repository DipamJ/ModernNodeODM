import os
import sys
import numpy as np
from osgeo import gdal, ogr, osr
import glob
import models.rs2 as rs2
import geopandas as gpd
import matplotlib.pyplot as plt

def generate_cc_dat(input_image, output_folder, file_prefix):
    """
    Generate a canopy cover .dat file from an orthomosaic image.
    
    Parameters:
      input_image (str): Path to the orthomosaic image.
      output_folder (str): Folder where the generated file will be stored.
      file_prefix (str): Prefix for the output file name.
    """
    # Thresholds for canopy classification
    th1 = 0.95
    th2 = 0.95
    th3 = 20

    # Load the orthomosaic image using RSImage
    try:
        img_obj = rs2.RSImage(input_image)
    except Exception as e:
        raise Exception("Error opening image: " + str(e))

    # Extract first three bands (red, green, blue) as float32 arrays
    red = img_obj.img[0, :, :].astype(np.float32)
    green = img_obj.img[1, :, :].astype(np.float32)
    blue = img_obj.img[2, :, :].astype(np.float32)

    # Avoid division by zero in green band
    green[green == 0] = 0.0001

    # Compute indices
    i1 = red / green
    i2 = blue / green
    i3 = 2 * green - blue - red

    # Create binary canopy mask based on conditions
    canopy_mask = np.logical_and(np.logical_and(i1 < th1, i2 < th2), i3 > th3).astype(np.uint8)

    # Ensure output folder exists
    cc_rgb_subfolder = os.path.join(output_folder, "cc_rgb")
    if not os.path.exists(cc_rgb_subfolder):
        os.makedirs(cc_rgb_subfolder)

     # Define the output file path
    output_file = os.path.join(cc_rgb_subfolder, file_prefix + "_cc_rgb.dat")
    
    # If the file already exists, skip generation
    if os.path.exists(output_file):
        print("Canopy cover .dat file already exists: " + output_file)
        return output_file

    # Create and write the .dat file using GDAL ENVI driver
    driver = gdal.GetDriverByName("ENVI")
    out_ds = driver.Create(output_file, img_obj.ncol, img_obj.nrow, 1, gdal.GDT_Byte)
    out_ds.SetGeoTransform(img_obj.geotransform)
    out_ds.SetProjection(img_obj.ds.GetProjection())
    out_ds.GetRasterBand(1).WriteArray(canopy_mask)
    out_ds.FlushCache()
    out_ds = None

    print("Canopy cover .dat file generated:", output_file)

def generate_cc_boundary(epsg, boundary_geojson, out_dir, selected_orthomosaic_FileName_noExt):
    """
    Generate a new GeoJSON boundary file with canopy cover attributes using geopandas.
    """
    sys.stdout.write("Inside generate_cc_boundary (metadata-aware version)\n")

    # Read the boundary file
    gdf = gpd.read_file(boundary_geojson)
    sys.stdout.write(f"Loaded boundary file with {len(gdf)} features.\n")

    # Load sample .dat file to extract CRS from metadata
    cc_rgb_dir = os.path.join(out_dir, "cc_rgb")
    dat_files = glob.glob(os.path.join(cc_rgb_dir, "*.dat"))
    dat_files.sort()
    if not dat_files:
        raise FileNotFoundError("No .dat files found in canopy cover directory.")

    sample_img_path = dat_files[0]
    cc_img_sample = rs2.RSImage(sample_img_path)
    raster_crs_wkt = cc_img_sample.ds.GetProjection()
    raster_crs = osr.SpatialReference(wkt=raster_crs_wkt)
    raster_epsg = raster_crs.GetAttrValue("AUTHORITY", 1)

    if raster_epsg:
        raster_epsg = int(raster_epsg)
        gdf = gdf.to_crs(epsg=raster_epsg)
        sys.stdout.write(f"Reprojected boundary to match raster EPSG:{raster_epsg}\n")
    else:
        sys.stdout.write("Warning: Unable to detect EPSG code from raster; using boundary CRS as-is.\n")

    # Prepare output directory
    boundary_out_dir = os.path.join(out_dir, "cc_boundary")
    if not os.path.exists(boundary_out_dir):
        os.makedirs(boundary_out_dir)

    out_geojson = os.path.join(boundary_out_dir, f"cc_boundary_{selected_orthomosaic_FileName_noExt}.geojson")
    if os.path.exists(out_geojson):
        sys.stdout.write("Output GeoJSON already exists. Skipping generation.\n")
        return

    # Loop over .dat files and compute attributes
    for dat_file in dat_files:
        basename = os.path.basename(dat_file)
        try:
            date_str = basename.split("20", 1)[1].split("_", 1)[0]
            field_name = "20" + date_str
        except Exception as e:
            sys.stdout.write(f"Error extracting date from {basename}: {e}\n")
            continue

        if field_name not in gdf.columns:
            gdf[field_name] = None
            sys.stdout.write(f"Created field: {field_name}\n")

        try:
            cc_img = rs2.RSImage(dat_file)
        except Exception as e:
            sys.stdout.write(f"Error opening .dat file {dat_file}: {e}\n")
            continue

        canopy_ratios = []
        for idx in range(len(gdf)):
            try:
                clipped = cc_img.clip_by_polygon_geopandas(boundary_geojson, feature_index=idx)
                if clipped is None:
                    ratio = 0
                else:
                    band_data = clipped[0, :, :] if clipped.ndim == 3 else clipped
                    band_data = band_data[~np.isnan(band_data)]
                    band_data = band_data[~np.isinf(band_data)]
                    if band_data.size == 0:
                        ratio = 0
                    else:
                        ratio = (band_data.sum() / band_data.size) * 100

                    # Save individual plot image (optional)
                    if not os.path.exists("output"):
                        os.makedirs("output")
                    plt.figure()
                    plt.imshow(band_data, cmap='gray')
                    plt.title(f"Feature {idx} - {field_name} ({ratio:.2f}%)")
                    plt.colorbar()
                    plt.savefig(f"output/plot_{idx}_{field_name}.png")
                    plt.close()

                canopy_ratios.append(ratio)
            except Exception as e:
                sys.stdout.write(f"Error processing feature {idx} in {basename}: {e}\n")
                canopy_ratios.append(0)

        gdf[field_name] = canopy_ratios

        # Optional histogram
        plt.figure()
        plt.hist(canopy_ratios, bins=10)
        plt.title(f"Histogram - {field_name}")
        plt.xlabel("Canopy Cover (%)")
        plt.ylabel("Count")
        plt.savefig(f"output/hist_{field_name}.png")
        plt.close()

    # Save output GeoJSON
    gdf.to_file(out_geojson, driver='GeoJSON')
    sys.stdout.write(f"Finished generating attribute GeoJSON: {out_geojson}\n")

def get_cc(epsg, shp, out_dir, selected_orthomosaic_FileName_noExt):

	selected_orthomosaic_FileName = selected_orthomosaic_FileName_noExt
	selected_boundary = os.path.basename(shp)
	selected_boundary_array = selected_boundary.split(".")
	selected_boundary_FileName_noExt = selected_boundary_array[0]

	gdal.UseExceptions()

	# Coordinate system
	sproj = osr.SpatialReference()
	sproj.ImportFromEPSG(int(epsg))

	in_dir_cc_ndvi = os.path.join(out_dir, 'cc_rgb')
	print(in_dir_cc_ndvi)
	files_cc_ndvi = glob.glob(os.path.join(in_dir_cc_ndvi, '*.dat'))
	files_cc_ndvi.sort()
	print('files_cc_ndvi:')
	print(files_cc_ndvi)

	out_dir = os.path.join(out_dir, 'cc_boundary')
	if not os.path.exists(out_dir):
			os.mkdir(out_dir)

	out_cc = os.path.join(out_dir, ('cc_boundary_' + selected_orthomosaic_FileName + ".shp"))

	print ("Crop Shape")
	## shapefile open
	driver = ogr.GetDriverByName('ESRI Shapefile') #file type
	shapef = driver.Open(shp, 1)
	lyr = shapef.GetLayer()
	spatialRef = lyr.GetSpatialRef() # Get projection

	## Create the output shapefile
	outDriver = ogr.GetDriverByName('ESRI Shapefile')

	if os.path.exists(out_cc):
		outDriver.DeleteDataSource(out_cc)

	outDataSource_cc = outDriver.CreateDataSource(out_cc)
	outLayer_cc = outDataSource_cc.CopyLayer(lyr, "agrilife")
	out_fn_prj_cc = os.path.splitext(out_cc)[0] + '.prj'

	spatialRef.MorphToESRI()
	file = open(out_fn_prj_cc, 'w')
	file.write(spatialRef.ExportToWkt())
	file.close()

	outDataSource_cc = None
	shapef = None

	# Create an OGR layer from a boundary shapefile
	driver = ogr.GetDriverByName('ESRI Shapefile') #file type
	shapef_out_cc = driver.Open(out_cc, 1)
	ccLayer = shapef_out_cc.GetLayer()

	cc_ratio_defn = []
	for fn in files_cc_ndvi:
		basename = os.path.basename(fn)
		print("basename: ")
		print(basename)
		date_str = basename.split("20", 1)[1].split("_",1)[0]
		cc_ratio_defn.append(ogr.FieldDefn('20' + date_str, ogr.OFTReal))
		#cc_ratio_defn.append(ogr.FieldDefn('20'+date_str, ogr.OFTReal))

	for tt in cc_ratio_defn:
		ccLayer.CreateField(tt)

	for i in range(0, len(files_cc_ndvi)):

		print ("Multi Processing (%d/%d) [%.2f]" % (i+1, len(files_cc_ndvi), float(i+1) / len(files_cc_ndvi) * 100.0))

		# Create an OGR layer from a boundary shapefile
		driver = ogr.GetDriverByName('ESRI Shapefile') #file type
		shapef_out_cc = driver.Open(out_cc, 1)
		ccLayer = shapef_out_cc.GetLayer()

		cc_fn = files_cc_ndvi[i]

		basename = os.path.basename(cc_fn)
		date_str = basename.split("20", 1)[1].split("_", 1)[0]

		print ("Image reading")
		cc_img = rs2.RSImage(cc_fn)

		print ("Extracting attribute")
		for crop_poly in ccLayer:

			geoTrans = cc_img.geotransform
			clipped_cc = cc_img.clip_by_polygon(crop_poly)

			## CC
			filtered_cc = clipped_cc[0,:,:]
			# filtered_cc = filtered_cc[np.nonzero(filtered_cc)]
			filtered_cc = filtered_cc[~np.isnan(filtered_cc)]
			filtered_cc = filtered_cc[~np.isinf(filtered_cc)]

			total_num_pix = filtered_cc.size
			cc_num_pix = filtered_cc.sum()
			cc_ratio = float(cc_num_pix) / float(total_num_pix) * 100

			crop_poly.SetField('20' + date_str, float(cc_ratio))
			#crop_poly.SetField('20'+date_str, float(cc_ratio))
			ccLayer.SetFeature(crop_poly)

		cc_img = None


	gdal.ErrorReset()
	shapef_out_cc = None