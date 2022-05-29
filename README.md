# Medical Visualization WebApp

This is a  Web GUI application that does 3D visualization of DICOM series Using VTK.js library.

## Website Link

### <a href= "https://mo-gaafar.github.io/Medical_Visualization_WebApp/dist/index.html">🔗 Click Here</a>


## Our Team

| Names             |
| ----------------- |
| Mohamed Nasser    |
| Ahmed Osama       |
| Mariam Hanafy     |
| Hassan Samy       |

## Features

### Ray Casting Volume Rendering and Volume Cropping

![chest](./preview1.png)

### Surface Rendering with adjustable ISO value

![skull](./preview2.png)

## Video Preview

![animation](./Animation.gif)

## Issues we faced

1. Merging the examples together into one javascript file was challenging.
2. Connecting the button to the different functions in the script to act as tabs
3. BASE_PATH relative reference was not working so we had to replace it multiple times when using old examples
4. Merging the transfer function into the cropping tab.
5. Understanding the role of each object in the rendering pipeline. (actor, renderer, mapper, volume)

## how we solved these problems 
1. it was solved by making functions for each example in order to view them separately and later on these functions was
connected to 2 separate tabs one for the chest example and the other for the head example.
2. this issue was solved by using queryselector which returns the first element that matches the selectors id in our case it is the function of the 
examples.
3. we had to replace it multiple times when using old example so it could work.
4. 
5. Rendring is taking data and change it to 3D objects. 
Actor used to represent an entity in a rendering scene.
Mapper is to map points into the rendring scene.
Volume similar to Actor, holds the property and mapper
 
