#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Generate canopy cover attributes from an orthomosaic image and a plot boundary shapefile.
The script clips the orthomosaic to the plot boundary, computes a canopy cover mask,
calculates the percentage of canopy cover, and outputs these attributes to CSV and Excel.

Usage:
    python canopy_cover_attributes.py <orthomosaic_image> <boundary_shapefile> <output_csv>
    
Example:
    python canopy_cover_attributes.py /path/to/ortho.tif /path/to/plot_boundary.shp /path/to/output/attributes.csv
"""

import os
import sys
import numpy as np
import pandas as pd
from osgeo import gdal, ogr, osr

# Suppress numpy warnings
np.seterr(invalid='ignore', divide='ignore')

def clip_image_with_shapefile(image_path, shp_path, output_path):
    """
    Clip the raster image to the boundary defined in the shapefile using GDAL Warp.
    """
    warp_options = gdal.WarpOptions(
        cutlineDSName=shp_path,
        cropToCutline=True,
        dstNodata=0
    )
    gdal.Warp(output_path, image_path, options=warp_options)
    return output_path

def compute_canopy_cover(image_path, threshold1=0.95, threshold2=0.95, threshold3=20):
    """
    Compute a canopy cover mask from an image.
    
    Assumes the image has at least three bands (red, green, blue) and computes:
       i1 = red / green < threshold1
       i2 = blue / green < threshold2
       i3 = (2 * green - blue - red) > threshold3
    
    Pixels meeting all conditions are considered canopy.
    
    Returns:
      canopy_mask (np.uint8): Binary mask (1 for canopy, 0 for non-canopy)
      percent_cover (float): Percentage of canopy cover
      total_pixels (int): Total number of pixels in the image
      canopy_pixels (int): Number of canopy pixels
    """
    ds = gdal.Open(image_path)
    if ds is None:
        raise Exception("Unable to open image: " + image_path)
    
    # Read the first three bands (assumed order: red, green, blue)
    red = ds.GetRasterBand(1).ReadAsArray().astype(np.float32)
    green = ds.GetRasterBand(2).ReadAsArray().astype(np.float32)
    blue = ds.GetRasterBand(3).ReadAsArray().astype(np.float32)
    ds = None  # Close dataset
    
    # Avoid division by zero
    green[green == 0] = 0.0001

    i1 = red / green
    i2 = blue / green
    i3 = 2 * green - blue - red

    cond = np.logical_and(np.logical_and(i1 < threshold1, i2 < threshold2), i3 > threshold3)
    canopy_mask = cond.astype(np.uint8)

    total_pixels = canopy_mask.size
    canopy_pixels = np.count_nonzero(canopy_mask)
    percent_cover = (canopy_pixels / total_pixels) * 100

    return canopy_mask, percent_cover, total_pixels, canopy_pixels

def save_mask_as_geotiff(mask, reference_image_path, output_path):
    """
    Save the canopy mask as a GeoTIFF using geotransform and projection info
    from a reference image.
    """
    ref_ds = gdal.Open(reference_image_path)
    if ref_ds is None:
        raise Exception("Unable to open reference image: " + reference_image_path)
    geotransform = ref_ds.GetGeoTransform()
    projection = ref_ds.GetProjection()
    cols = ref_ds.RasterXSize
    rows = ref_ds.RasterYSize
    ref_ds = None

    driver = gdal.GetDriverByName('GTiff')
    out_ds = driver.Create(output_path, cols, rows, 1, gdal.GDT_Byte)
    out_ds.SetGeoTransform(geotransform)
    out_ds.SetProjection(projection)
    out_ds.GetRasterBand(1).WriteArray(mask)
    out_ds.FlushCache()
    out_ds = None

def main():
    if len(sys.argv) < 4:
        print("Usage: python canopy_cover_attributes.py <orthomosaic_image> <boundary_shapefile> <output_csv>")
        sys.exit(1)

    orthomosaic_path = sys.argv[1]
    boundary_shp = sys.argv[2]
    output_csv = sys.argv[3]
    output_folder = os.path.dirname(output_csv)
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Define temporary output paths
    clipped_image_path = os.path.join(output_folder, "clipped_orthomosaic.tif")
    mask_path = os.path.join(output_folder, "canopy_mask.tif")

    print("Clipping orthomosaic to plot boundary...")
    clip_image_with_shapefile(orthomosaic_path, boundary_shp, clipped_image_path)
    print("Clipped image saved to:", clipped_image_path)

    print("Computing canopy cover mask...")
    canopy_mask, percent_cover, total_pixels, canopy_pixels = compute_canopy_cover(clipped_image_path)
    print(f"Canopy cover: {percent_cover:.2f}% ({canopy_pixels} of {total_pixels} pixels)")

    print("Saving canopy mask as GeoTIFF...")
    save_mask_as_geotiff(canopy_mask, clipped_image_path, mask_path)
    print("Canopy mask saved to:", mask_path)

    # Prepare attribute data
    attributes = {
        "Orthomosaic": [os.path.basename(orthomosaic_path)],
        "Boundary": [os.path.basename(boundary_shp)],
        "TotalPixels": [total_pixels],
        "CanopyPixels": [canopy_pixels],
        "CanopyCoverPercentage": [percent_cover]
    }
    df = pd.DataFrame(attributes)
    df.to_csv(output_csv, index=False)
    print("Canopy cover attributes saved to CSV:", output_csv)

    # Optionally, also save as Excel
    output_excel = os.path.splitext(output_csv)[0] + ".xlsx"
    df.to_excel(output_excel, index=False)
    print("Canopy cover attributes saved to Excel:", output_excel)

if __name__ == "__main__":
    main()
