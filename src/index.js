import { vec3, quat, mat4 } from 'gl-matrix';

import '@kitware/vtk.js/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/Profiles/Volume';
import '@kitware/vtk.js/Rendering/Profiles/Glyph';

import vtkWidgetManager from '@kitware/vtk.js/Widgets/Core/WidgetManager';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkImageCroppingWidget from '@kitware/vtk.js/Widgets/Widgets3D/ImageCroppingWidget';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkPlane from '@kitware/vtk.js/Common/DataModel/Plane';
import vtkPiecewiseGaussianWidget from '@kitware/vtk.js/Interaction/Widgets/PiecewiseGaussianWidget';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';


// Force the loading of HttpDataAccessHelper to support gzip decompression
// Force DataAccessHelper to have access to various data source
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkImageMarchingCubes from '@kitware/vtk.js/Filters/General/ImageMarchingCubes';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
function chest() {
  
document.body.innerHTML = ""
const controlPanel=`<table>

  <tr> 
    <td>  
      <button id="visualizechest">Visualize Chest</button>
    </td>
    <td> 
      <button id="visualizehead">Visualize Head</button>
    </td>
    <td> 
      <button id="visualizegaussian">Visualize Gaussian</button>
    </td>
  </tr> 
  <tr>
    <td>pickable</td>
    <td>
      <input class="flag" data-name="pickable" type="checkbox" checked="checked">
    </td>
  </tr>
  <tr>
    <td>visibility</td>
    <td>
      <input class="flag" data-name="visibility" type="checkbox" checked="checked">
    </td>
  </tr>
  <tr>
    <td>contextVisibility</td>
    <td>
      <input class="flag" data-name="contextVisibility" type="checkbox" checked="checked">
    </td>
  </tr>
  <tr>
    <td>handleVisibility</td>
    <td>
      <input class="flag" data-name="handleVisibility" type="checkbox" checked="checked">
    </td>
  </tr>
  <tr>
    <td>faceHandlesEnabled</td>
    <td>
      <input class="flag" data-name="faceHandlesEnabled" type="checkbox" checked="checked">
    </td>
  </tr>
  <tr>
    <td>edgeHandlesEnabled</td>
    <td>
      <input class="flag" data-name="edgeHandlesEnabled" type="checkbox" checked="checked">
    </td>
  </tr>
  <tr>
    <td>cornerHandlesEnabled</td>
    <td>
      <input class="flag" data-name="cornerHandlesEnabled" type="checkbox" checked="checked">
    </td>
  </tr>
</table>`;
// Standard rendering code setup
// ----------------------------------------------------------------------------

const rootContainer = document.querySelector(
  '.vtk-js-example-piecewise-gaussian-widget'
);
const containerStyle = rootContainer ? { height: '100%' } : null;
const urlToLoad = rootContainer
  ? rootContainer.dataset.url ||
    'https://kitware.github.io/vtk-js/data/volume/LIDC2.vti'
  : `https://kitware.github.io/vtk-js/data/volume/LIDC2.vti`;

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  background: [0, 0, 0],
  rootContainer,
  containerStyle,
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();
  const apiRenderWindow = fullScreenRenderer.getApiSpecificRenderWindow()

renderWindow.getInteractor().setDesiredUpdateRate(15.0);
//......

//const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
    //background: [0, 0, 0],
  //});
  //const renderWindow = fullScreenRenderWindow.getRenderWindow();
  //const renderer = fullScreenRenderWindow.getRenderer();
  
  //fullScreenRenderWindow.addController(controlPanel1);
  
 // const actor1 = vtkActor.newInstance();
  //const mapper1 = vtkMapper.newInstance();
  //const marchingCube1 = vtkImageMarchingCubes.newInstance({
    //contourValue: 0.0,
    //computeNormals: true,
    //mergePoints: true,
 // });
  // 2D overlay rendering
  // ----------------------------------------------------------------------------
  
  const overlaySize = 15;
  const overlayBorder = 2;
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.width = `${overlaySize}px`;
  overlay.style.height = `${overlaySize}px`;
  overlay.style.border = `solid ${overlayBorder}px red`;
  overlay.style.borderRadius = '50%';
  overlay.style.left = '-100px';
  overlay.style.pointerEvents = 'none';
  document.querySelector('body').appendChild(overlay);
  
  // ----------------------------------------------------------------------------
  // Widget manager
  // ----------------------------------------------------------------------------
  
  const widgetManager = vtkWidgetManager.newInstance();
  widgetManager.setRenderer(renderer);
  
  const widget = vtkImageCroppingWidget.newInstance();
  
  function widgetRegistration(e) {
    const action = e ? e.currentTarget.dataset.action : 'addWidget';
    const viewWidget = widgetManager[action](widget);
    if (viewWidget) {
      viewWidget.setDisplayCallback((coords) => {
        overlay.style.left = '-100px';
        if (coords) {
          const [w, h] = apiRenderWindow.getSize();
          overlay.style.left = `${Math.round(
            (coords[0][0] / w) * window.innerWidth -
              overlaySize * 0.5 -
              overlayBorder
          )}px`;
          overlay.style.top = `${Math.round(
            ((h - coords[0][1]) / h) * window.innerHeight -
              overlaySize * 0.5 -
              overlayBorder
          )}px`;
        }
      });
  
      renderer.resetCamera();
      renderer.resetCameraClippingRange();
    }
    widgetManager.enablePicking();
    renderWindow.render();
  }
  
  // Initial widget register
  widgetRegistration();
  
  // ----------------------------------------------------------------------------
  // Volume rendering
  // ----------------------------------------------------------------------------
  
  const reader2 = vtkHttpDataSetReader.newInstance({ fetchGzip: true });
  
  const actor2 = vtkVolume.newInstance();
  const mapper2 = vtkVolumeMapper.newInstance();
  mapper2.setSampleDistance(1.1);
  actor2.setMapper(mapper2);
  
  // create color and opacity transfer functions
  const ctfun = vtkColorTransferFunction.newInstance();
  ctfun.addRGBPoint(0, 85 / 255.0, 0, 0);
  ctfun.addRGBPoint(95, 1.0, 1.0, 1.0);
  ctfun.addRGBPoint(225, 0.66, 0.66, 0.5);
  ctfun.addRGBPoint(255, 0.3, 1.0, 0.5);
  const ofun = vtkPiecewiseFunction.newInstance();
  ofun.addPoint(0.0, 0.0);
  ofun.addPoint(255.0, 1.0);
  actor2.getProperty().setRGBTransferFunction(0, ctfun);
  actor2.getProperty().setScalarOpacity(0, ofun);
  actor2.getProperty().setScalarOpacityUnitDistance(0, 3.0);
  actor2.getProperty().setInterpolationTypeToLinear();
  actor2.getProperty().setUseGradientOpacity(0, true);
  actor2.getProperty().setGradientOpacityMinimumValue(0, 2);
  actor2.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
  actor2.getProperty().setGradientOpacityMaximumValue(0, 20);
  actor2.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
  actor2.getProperty().setShade(true);
  actor2.getProperty().setAmbient(0.2);
  actor2.getProperty().setDiffuse(0.7);
  actor2.getProperty().setSpecular(0.3);
  actor2.getProperty().setSpecularPower(8.0);
  
  mapper2.setInputConnection(reader2.getOutputPort());
  
  // -----------------------------------------------------------
  // Get data
  // -----------------------------------------------------------
  
  function getCroppingPlanes(imageData, ijkPlanes) {
    const rotation = quat.create();
    mat4.getRotation(rotation, imageData.getIndexToWorld());
  
    const rotateVec = (vec) => {
      const out = [0, 0, 0];
      vec3.transformQuat(out, vec, rotation);
      return out;
    };
  
    const [iMin, iMax, jMin, jMax, kMin, kMax] = ijkPlanes;
    const origin = imageData.indexToWorld([iMin, jMin, kMin]);
    // opposite corner from origin
    const corner = imageData.indexToWorld([iMax, jMax, kMax]);
    return [
      // X min/max
      vtkPlane.newInstance({ normal: rotateVec([1, 0, 0]), origin }),
      vtkPlane.newInstance({ normal: rotateVec([-1, 0, 0]), origin: corner }),
      // Y min/max
      vtkPlane.newInstance({ normal: rotateVec([0, 1, 0]), origin }),
      vtkPlane.newInstance({ normal: rotateVec([0, -1, 0]), origin: corner }),
      // X min/max
      vtkPlane.newInstance({ normal: rotateVec([0, 0, 1]), origin }),
      vtkPlane.newInstance({ normal: rotateVec([0, 0, -1]), origin: corner }),
    ];
  }
  
  reader2.setUrl(`https://kitware.github.io/vtk-js/data/volume/LIDC2.vti`).then(() => {
    reader2.loadData().then(() => {
      const image = reader2.getOutputData();
  
      // update crop widget
      widget.copyImageDataDescription(image);
      const cropState = widget.getWidgetState().getCroppingPlanes();
      cropState.onModified(() => {
        const planes = getCroppingPlanes(image, cropState.getPlanes());
        mapper2.removeAllClippingPlanes();
        planes.forEach((plane) => {
          mapper2.addClippingPlane(plane);
        });
        mapper2.modified();
      });
  
      // add volume to renderer
      renderer.addVolume(actor2);
      renderer.resetCamera();
      renderer.resetCameraClippingRange();
      renderWindow.render();
    });
  });
  
  // -----------------------------------------------------------
  // UI control handling
  // -----------------------------------------------------------
  
  fullScreenRenderer.addController(controlPanel);
  
  function updateFlag(e) {
    const value = !!e.target.checked;
    const name = e.currentTarget.dataset.name;
    widget.set({ [name]: value }); // can be called on either viewWidget or parentWidget
  
    widgetManager.enablePicking();
    renderWindow.render();
  }
  
  const elems = document.querySelectorAll('.flag');
  for (let i = 0; i < elems.length; i++) {
    elems[i].addEventListener('change', updateFlag);
  }
  
  const buttons = document.querySelectorAll('button');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', widgetRegistration);
  }

  document.querySelector("#visualizehead").addEventListener("click", Head)
  document.querySelector("#visualizegaussian").addEventListener("click", Gaussian)

}


 function Head(){
  document.body.innerHTML = ""
  const controlPanel=`<table>

  <tr> 
    <td>  
      <button id="visualizechest">Visualize Chest</button>
    </td>
    <td> 
      <button id="visualizehead">Visualize Head</button>
    </td>
    <td> 
      <button id="visualizegaussian">Visualize Gaussian</button>
    </td>
  </tr> 
  <tr>
    <td>Iso value</td>
    <td>
    <input class="isoValue" type="range" min="0" max="3926" step="0.05" value="1308.6666666666667">
    </td>
  </tr>
</table>`; 
  
const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
  background: [0, 0, 0],
});
const renderWindow = fullScreenRenderWindow.getRenderWindow();
const renderer = fullScreenRenderWindow.getRenderer();

fullScreenRenderWindow.addController(controlPanel);

const actor = vtkActor.newInstance();
const mapper = vtkMapper.newInstance();
const marchingCube = vtkImageMarchingCubes.newInstance({
  contourValue: 0.0,
  computeNormals: true,
  mergePoints: true,
});

actor.setMapper(mapper);
mapper.setInputConnection(marchingCube.getOutputPort());

function updateIsoValue(e) {
  const isoValue = Number(e.target.value);
  marchingCube.setContourValue(isoValue);
  renderWindow.render();
}

const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });
marchingCube.setInputConnection(reader.getOutputPort());

reader
  .setUrl(`https://kitware.github.io/vtk-js/data/volume/headsq.vti`, { loadData: true })
  .then(() => {
    const data = reader.getOutputData();
    const dataRange = data.getPointData().getScalars().getRange();
    const firstIsoValue = (dataRange[0] + dataRange[1]) / 3;

    const el = document.querySelector('.isoValue');
    el.setAttribute('min', dataRange[0]);
    el.setAttribute('max', dataRange[1]);
    el.setAttribute('value', firstIsoValue);
    el.addEventListener('input', updateIsoValue);

    marchingCube.setContourValue(firstIsoValue);
    renderer.addActor(actor);
    renderer.getActiveCamera().set({ position: [1, 1, 0], viewUp: [0, 0, -1] });
    renderer.resetCamera();
    renderWindow.render();
  })

   document.querySelector("#visualizechest").addEventListener("click", chest)
   document.querySelector("#visualizegaussian").addEventListener("click", Gaussian)

}

function Gaussian() {
    document.body.innerHTML = ""
  const controlPanel=`<table>

  <tr> 
    <td>  
      <button id="visualizechest">Visualize Chest</button>
    </td>
    <td> 
      <button id="visualizehead">Visualize Head</button>
    </td>
    <td> 
      <button id="visualizegaussian">Visualize Gaussian</button>
    </td>
  </tr> 
  <tr>
  </tr>
</table>`; 
  
  // ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const rootContainer = document.querySelector(
  '.vtk-js-example-piecewise-gaussian-widget'
);
const containerStyle = rootContainer ? { height: '100%' } : null;
const urlToLoad = rootContainer
  ? rootContainer.dataset.url ||
    'https://kitware.github.io/vtk-js/data/volume/LIDC2.vti'
    : `https://kitware.github.io/vtk-js/data/volume/LIDC2.vti`;
  
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
      rootContainer,
      containerStyle,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();
    renderWindow.getInteractor().setDesiredUpdateRate(15.0);
    fullScreenRenderer.addController(controlPanel);
    
    
    // const actor = vtkActor.newInstance();
    // const mapper = vtkMapper.newInstance();
    // const marchingCube = vtkImageMarchingCubes.newInstance({
//   contourValue: 0.0,
//   computeNormals: true,
//   mergePoints: true,
// });
const body = rootContainer || document.querySelector('body');

// Create Widget container
const widgetContainer = document.createElement('div');
widgetContainer.style.position = 'absolute';
widgetContainer.style.top = 'calc(10px + 1em)';
widgetContainer.style.left = '5px';
widgetContainer.style.background = 'rgba(255, 255, 255, 0.3)';
widgetContainer.style.marginLeft = '1300px';
body.appendChild(widgetContainer);

// Create Label for preset
const labelContainer = document.createElement('div');
labelContainer.style.position = 'absolute';
labelContainer.style.top = '5px';
labelContainer.style.left = '5px';
labelContainer.style.width = '100%';
labelContainer.style.color = 'white';
labelContainer.style.textAlign = 'center';
labelContainer.style.userSelect = 'none';
labelContainer.style.cursor = 'pointer';
body.appendChild(labelContainer);

let presetIndex = 1;
const globalDataRange = [0, 255];
const lookupTable = vtkColorTransferFunction.newInstance();

function changePreset(delta = 1) {
  presetIndex =
    (presetIndex + delta + vtkColorMaps.rgbPresetNames.length) %
    vtkColorMaps.rgbPresetNames.length;
  lookupTable.applyColorMap(
    vtkColorMaps.getPresetByName(vtkColorMaps.rgbPresetNames[presetIndex])
  );
  lookupTable.setMappingRange(...globalDataRange);
  lookupTable.updateRange();
  labelContainer.innerHTML = vtkColorMaps.rgbPresetNames[presetIndex];
}

let intervalID = null;
function stopInterval() {
  if (intervalID !== null) {
    clearInterval(intervalID);
    intervalID = null;
  }
}

labelContainer.addEventListener('click', (event) => {
  if (event.pageX < 200) {
    stopInterval();
    changePreset(-1);
  } else {
    stopInterval();
    changePreset(1);
  }
});

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------

const widget = vtkPiecewiseGaussianWidget.newInstance({
  numberOfBins: 256,
  size: [400, 150],
});
widget.updateStyle({
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  histogramColor: 'rgba(100, 100, 100, 0.5)',
  strokeColor: 'rgb(0, 0, 0)',
  activeColor: 'rgb(255, 255, 255)',
  handleColor: 'rgb(50, 150, 50)',
  buttonDisableFillColor: 'rgba(255, 255, 255, 0.5)',
  buttonDisableStrokeColor: 'rgba(0, 0, 0, 0.5)',
  buttonStrokeColor: 'rgba(0, 0, 0, 1)',
  buttonFillColor: 'rgba(255, 255, 255, 1)',
  strokeWidth: 2,
  activeStrokeWidth: 3,
  buttonStrokeWidth: 1.5,
  handleWidth: 3,
  iconSize: 20, // Can be 0 if you want to remove buttons (dblClick for (+) / rightClick for (-))
  padding: 10,
});

fullScreenRenderer.setResizeCallback(({ width, height }) => {
  widget.setSize(Math.min(450, width - 10), 150);
});

const piecewiseFunction = vtkPiecewiseFunction.newInstance();

const actor = vtkVolume.newInstance();
const mapper = vtkVolumeMapper.newInstance({ sampleDistance: 1.1 });
const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });

reader.setUrl(urlToLoad).then(() => {
  reader.loadData().then(() => {
    const imageData = reader.getOutputData();
    const dataArray = imageData.getPointData().getScalars();
    const dataRange = dataArray.getRange();
    globalDataRange[0] = dataRange[0];
    globalDataRange[1] = dataRange[1];

    // Update Lookup table
    changePreset();

    // // Automatic switch to next preset every 5s
    // if (!rootContainer) {
    //   intervalID = setInterval(changePreset, 5000);
    // }

    widget.setDataArray(dataArray.getData());
    widget.applyOpacity(piecewiseFunction);

    widget.setColorTransferFunction(lookupTable);
    lookupTable.onModified(() => {
      widget.render();
      renderWindow.render();
    });

    renderer.addVolume(actor);
    renderer.resetCamera();
    renderer.getActiveCamera().elevation(70);
    renderWindow.render();
  });
});

actor.setMapper(mapper);
mapper.setInputConnection(reader.getOutputPort());

actor.getProperty().setRGBTransferFunction(0, lookupTable);
actor.getProperty().setScalarOpacity(0, piecewiseFunction);
actor.getProperty().setInterpolationTypeToFastLinear();

// ----------------------------------------------------------------------------
// Default setting Piecewise function widget
// ----------------------------------------------------------------------------

widget.addGaussian(0.425, 0.5, 0.2, 0.3, 0.2);
widget.addGaussian(0.75, 1, 0.3, 0, 0);

widget.setContainer(widgetContainer);
widget.bindMouseListeners();

widget.onAnimation((start) => {
  if (start) {
    renderWindow.getInteractor().requestAnimation(widget);
  } else {
    renderWindow.getInteractor().cancelAnimation(widget);
  }
});

widget.onOpacityChange(() => {
  widget.applyOpacity(piecewiseFunction);
  if (!renderWindow.getInteractor().isAnimating()) {
    renderWindow.render();
  }
});


// ----------------------------------------------------------------------------
// Expose variable to global namespace
// ----------------------------------------------------------------------------

  global.widget = widget;
  document.querySelector("#visualizechest").addEventListener("click", chest)
  document.querySelector("#visualizehead").addEventListener("click", Head)
  
}

document.body.style.backgroundColor = "#555555"
document.body.innerHTML = `
<div style="position: absolute; left: 30px; top: 30px; background-color: white; border-radius: 5px; list-style: none; padding: 5px 10px; margin: 0px; display: block; border: 1px solid black; max-width: calc(100% - 70px); max-height: calc(100% - 60px); overflow: auto;">
  <table>
    <tr>
      <td>
        <button id="visualizechest">Visualize Chest</button>
      </td>
      <td>
        <button id="visualizehead">Visualize Head</button>
      </td>
      <td>
        <button id="visualizegaussian">Transfer Function</button>
      </td>
    </tr>
  </table>
</div>
`





document.querySelector("#visualizechest").addEventListener("click", chest)
document.querySelector("#visualizehead").addEventListener("click", Head)
document.querySelector("#visualizegaussian").addEventListener("click", Gaussian)









































