import os
import sys
import numpy as np
from osgeo import gdal, ogr, osr
import glob
import models.rs2 as rs2
import geopandas as gpd
import matplotlib.pyplot as plt
import tempfile
from qgis import processing

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
    Generate an updated GeoJSON boundary file with canopy cover attributes
    using QGIS processing to clip the canopy cover raster by each polygon.
    """
    # Read the boundary file
    gdf = gpd.read_file(boundary_geojson)
    sys.stdout.write("Loaded boundary file with {} features. \n".format(len(gdf)))

    # Create output folder for updated boundary GeoJSON file
    boundary_out_dir = os.path.join(out_dir, "cc_boundary")
    if not os.path.exists(boundary_out_dir):
        os.makedirs(boundary_out_dir)
    out_geojson = os.path.join(boundary_out_dir, "cc_boundary_" + selected_orthomosaic_FileName_noExt + ".geojson")
    sys.stdout.write("Output boundary GeoJSON: \n" + out_geojson)

    # Extract a field name from the orthomosaic filename (adjust as needed)
    field_name = selected_orthomosaic_FileName_noExt.split('_')[0]
    if field_name not in gdf.columns:
        gdf[field_name] = None

    # Locate the canopy cover .dat file; assume one file exists in cc_rgb folder
    cc_rgb_dir = os.path.join(out_dir, "cc_rgb")
    dat_files = glob.glob(os.path.join(cc_rgb_dir, "*.dat"))
    if not dat_files:
        sys.stdout.write("No canopy cover .dat file found in {} \n".format(cc_rgb_dir))
        return
    cc_dat_file = dat_files[0]

    canopy_ratios = []

    # Process each polygon feature one-by-one using QGIS's clip algorithm
    for idx, feature in gdf.iterrows():
        # Write the single feature to a temporary GeoJSON file
        with tempfile.NamedTemporaryFile(suffix=".geojson", delete=False) as tmp_mask:
            single_feature = gdf.iloc[[idx]]
            single_feature.to_file(tmp_mask.name, driver="GeoJSON")
            tmp_mask_path = tmp_mask.name

        # Prepare a temporary output file for the clipped raster
        with tempfile.NamedTemporaryFile(suffix=".tif", delete=False) as tmp_output:
            tmp_output_path = tmp_output.name

        try:
            sys.stdout.write("cc_dat_file : " + str(cc_dat_file) + "\n")
            sys.stdout.write("boundary_geojson : " + str(boundary_geojson) + "\n")
            # Run QGIS processing tool "gdal:cliprasterbymasklayer"
            result = processing.run("gdal:cliprasterbymasklayer", {
                'INPUT': cc_dat_file,
                'MASK': boundary_geojson,
                'SOURCE_CRS': None,
                'TARGET_CRS': None,
                'TARGET_EXTENT':None,
                'NODATA':None,
                'ALPHA_BAND': True,
                'CROP_TO_CUTLINE': True,
                'KEEP_RESOLUTION': True,
                'SET_RESOLUTION':False,
                'X_RESOLUTION':None,
                'Y_RESOLUTION':None,
                'MULTITHREADING':False,
                'OPTIONS': '',
                'DATA_TYPE': 0,
                'EXTRA':'',
                'OUTPUT': tmp_output_path
            })
            clipped_raster_path = result['OUTPUT']

            # Open the clipped raster and read it as an array
            ds = gdal.Open(clipped_raster_path)
            if ds is None:
                sys.stdout.write(f"Feature {idx}: Unable to open clipped raster. \n")
                canopy_ratios.append(0)
                continue
            clipped_img = ds.ReadAsArray()
            ds = None

            # Compute canopy ratio from the clipped image
            if clipped_img is None:
                ratio = 0
                sys.stdout.write("clipped_img is None \n")
            else:
                # If multi-band, use first band
                if clipped_img.ndim == 3:
                    band_data = clipped_img[0]
                else:
                    band_data = clipped_img
                # Clean the array from NaN or infinite values
                band_data = band_data[~np.isnan(band_data)]
                band_data = band_data[~np.isinf(band_data)]
                if band_data.size == 0:
                    ratio = 0
                else:
                    total = band_data.size
                    canopy = band_data.sum()
                    ratio = (canopy / total) * 100
            canopy_ratios.append(ratio)

            # (Optional) Save a histogram for debugging
            plt.figure()
            plt.hist(band_data.flatten(), bins=10)
            plt.title(f"Histogram for feature {idx}")
            hist_path = os.path.join("output", f"figure_feature_{idx}.png")
            if not os.path.exists("output"):
                os.makedirs("output")
            plt.savefig(hist_path)
            plt.close()
            sys.stdout.write(f"Feature {idx} processed; canopy ratio: {ratio:.2f}%\n")
        except Exception as e:
            sys.stdout.write("Error processing feature {}: {}\n".format(idx, e))
            canopy_ratios.append(0)
        finally:
            # Clean up temporary files
            if os.path.exists(tmp_mask_path):
                os.remove(tmp_mask_path)
            if os.path.exists(tmp_output_path):
                os.remove(tmp_output_path)

    # Update the GeoDataFrame with the computed canopy ratios and write out the GeoJSON file.
    gdf[field_name] = canopy_ratios
    gdf.to_file(out_geojson, driver="GeoJSON")
    sys.stdout.write("Finished generating canopy cover boundary attributes.\n")