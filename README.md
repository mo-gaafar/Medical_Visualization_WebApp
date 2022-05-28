# Medical_Visualization_WebApp
This is a  Web GUI application that does 3D visualization of DICOM series Using VTK.js library.

# Features

## Ray Casting Volume Rendering and Volume Cropping

[]!(./preview1.png)

## Surface Rendering with adjustable ISO value

[]!(./preview2.png)

# Video Preview

[]!(./Animation.gif)

# Issues we faced

1. Merging the examples together into one javascript file was challenging.
2. Connecting the button to the different functions in the script to act as tabs
3. BASE_PATH relative reference was not working so we had to replace it multiple times when using old examples
4. Merging the transfer function into the cropping tab.
5. Understanding the role of each object in the rendering pipeline. (actor, renderer, mapper, volume)

# How we overcame the issues

1. 