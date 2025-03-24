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
    import sys
    sys.stdout.write("Inside generate_cc_boundary (geopandas version)\n")
    sys.stdout.write("Boundary GeoJSON: " + boundary_geojson + "\n")
    sys.stdout.write("Output directory: " + out_dir + "\n")
    sys.stdout.write("Orthomosaic base name: " + selected_orthomosaic_FileName_noExt + "\n")
    
    # Read the boundary file using geopandas
    gdf = gpd.read_file(boundary_geojson)
    sys.stdout.write("Loaded boundary file with {} features.\n".format(len(gdf)))
    
    # Create a spatial reference from the EPSG code (if needed for later processing)
    sproj = osr.SpatialReference()
    sproj.ImportFromEPSG(int(epsg))
    
    # Locate all .dat files in the cc_rgb folder
    cc_rgb_dir = os.path.join(out_dir, "cc_rgb")
    sys.stdout.write("Looking in: " + cc_rgb_dir + "\n")
    dat_files = glob.glob(os.path.join(cc_rgb_dir, "*.dat"))
    dat_files.sort()
    sys.stdout.write("Found .dat files:\n")
    for f in dat_files:
        sys.stdout.write(f + "\n")
    
    # Create output folder for the updated boundary GeoJSON file
    boundary_out_dir = os.path.join(out_dir, "cc_boundary")
    if not os.path.exists(boundary_out_dir):
        os.makedirs(boundary_out_dir)
    
    # Define the output GeoJSON file
    out_geojson = os.path.join(boundary_out_dir, "cc_boundary_" + selected_orthomosaic_FileName_noExt + ".geojson")
    sys.stdout.write("Output boundary GeoJSON: " + out_geojson + "\n")
    
    if os.path.exists(out_geojson):
        sys.stdout.write("Boundary GeoJSON already exists. Skipping generation.\n")
        return
    
    # For each .dat file, add a new column to the GeoDataFrame if not already present.
    for dat_file in dat_files:
        basename = os.path.basename(dat_file)
        try:
            date_str = basename.split("20", 1)[1].split("_", 1)[0]
            field_name = "20" + date_str
        except Exception as e:
            sys.stdout.write("Error extracting date from " + basename + ": " + str(e) + "\n")
            continue
        
        if field_name not in gdf.columns:
            gdf[field_name] = None
            sys.stdout.write("Created field: " + field_name + "\n")
    
    # Load the canopy cover .dat file for each date and update each feature's attribute.
    # For each dat_file, iterate over the features in gdf:
    for dat_file in dat_files:
        basename = os.path.basename(dat_file)
        try:
            date_str = basename.split("20", 1)[1].split("_", 1)[0]
            field_name = "20" + date_str
        except Exception as e:
            sys.stdout.write("Error extracting date from " + basename + ": " + str(e) + "\n")
            continue
        
        sys.stdout.write("Processing " + dat_file + " for field " + field_name + "\n")
        try:
            cc_img = rs2.RSImage(dat_file)
        except Exception as e:
            sys.stdout.write("Error opening .dat file " + dat_file + ": " + str(e) + "\n")
            continue
        
        # For each feature (row) in the GeoDataFrame, clip the image and compute canopy cover.
        canopy_ratios = []
        for idx in range(len(gdf)):
            try:
                clipped = cc_img.clip_by_polygon_geopandas(boundary_geojson, feature_index=idx)
                sys.stdout.write("clipped : " + str(clipped))
                if clipped is None:
                    ratio = 0
                else:
                    # Assume canopy pixels are represented as 0 in the mask:
                    band_data = clipped[0, :, :] if clipped.ndim == 3 else clipped
                    # Remove NaN or infinite values
                    band_data = band_data[~np.isnan(band_data)]
                    band_data = band_data[~np.isinf(band_data)]
                    if band_data.size == 0:
                        ratio = 0
                    else:
                        total = band_data.size
                        canopy = band_data.sum()
                        ratio = (canopy / total) * 100
                    plt.figure()
                    plt.imshow(band_data, cmap='gray')
                    plt.title(f"Feature {idx} for {field_name} | Ratio: {ratio:.2f}%")
                    plt.colorbar()
                    if not os.path.exists("output"):
                        os.makedirs("output")
                    plt.savefig(f"output/figure_feature_{idx}_{field_name}.png")
                    plt.close()
                canopy_ratios.append(ratio)
            except Exception as e:
                sys.stdout.write("Error processing feature {} in {}: {}\n".format(idx, dat_file, str(e)))
                canopy_ratios.append(0)
        # Update the GeoDataFrame column with the computed ratios.
        gdf[field_name] = canopy_ratios
        plt.figure()
        plt.hist(canopy_ratios, bins=10)
        plt.title(f"Histogram of canopy ratios for {field_name}")
        plt.xlabel("Canopy Cover Ratio (%)")
        plt.ylabel("Frequency")
        if not os.path.exists("output"):
            os.makedirs("output")
        plt.savefig(f"output/figure_canopy_ratio.png")
        plt.close()
        cc_img = None
    
    # Write the updated GeoDataFrame to the new GeoJSON file.
    gdf.to_file(out_geojson, driver='GeoJSON')
    sys.stdout.write("Finished generating canopy cover boundary attributes.\n")