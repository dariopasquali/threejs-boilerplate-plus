/**
* HUD.js
* @author Pierfrancesco Soffritti
*
*/

var pauseTextMaterial, HUDPauseMaterial;
var pointerMesh, redPointerMesh, LapCounterMesh;

var HUDElementsArray;

var gotStartingPoint = false, hasMoved;
var numLap = 0;

function HUD(HUDScene, HUDisVisible, oculusEnabled) {

  this.HUDisVisible = HUDisVisible;

  var textCanvas = document.createElement('canvas');
  var context = textCanvas.getContext('2d');
  context.font = "Bold 30px Arial";
  context.fillStyle = "rgba(255, 0, 0, 1)";
  context.fillText('LAP number: 1', 0, 50);

  // canvas contents will be used for a texture
  var textTexture = new THREE.Texture(textCanvas) 
  textTexture.needsUpdate = true;

  // load a sample texture
  //var texture = THREE.ImageUtils.loadTexture("textures/ui.png");
  
  var HUDSampleMaterial = new THREE.MeshBasicMaterial({  map: textTexture });
  HUDSampleMaterial.transparent = true
  HUDSampleMaterial.opacity = 1;
  LapCounterMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), HUDSampleMaterial);
  LapCounterMesh.scale.set(window.innerWidth / 2, window.innerHeight / 2, 1);
  LapCounterMesh.position.z = -0.01;
  LapCounterMesh.position.x = 1000;
  HUDscene.add(LapCounterMesh);

  // load minimap texture
  var texturePath = THREE.ImageUtils.loadTexture("textures/map.png");
  var HUDMinimapMaterial = new THREE.MeshBasicMaterial({  map: texturePath });
  HUDMinimapMaterial.transparent = true
  HUDMinimapMaterial.opacity = 1;
  var hudMinimapMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.586), HUDMinimapMaterial);
  if(oculusEnabled)
    hudMinimapMesh.scale.set(window.innerWidth / 3, window.innerHeight / 7, 1);
  else
    hudMinimapMesh.scale.set(window.innerWidth / 3, window.innerHeight / 3, 1);
  hudMinimapMesh.position.z = -0.01;
  hudMinimapMesh.position.x = 0;//1000;
  hudMinimapMesh.position.y = 0;//500;
  HUDscene.add(hudMinimapMesh);

  this.minimap = hudMinimapMesh;

  // load pointer (on minimap) texture

  var texturePath = THREE.ImageUtils.loadTexture("textures/pointer_red.png");
  var HUDRedPointerMaterial = new THREE.MeshBasicMaterial({  map: texturePath });
  HUDRedPointerMaterial.transparent = true
  HUDRedPointerMaterial.opacity = 1;
  redPointerMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), HUDRedPointerMaterial);
  redPointerMesh.scale.set(20, 20, 1);
  redPointerMesh.position.z = -0.01;
  HUDscene.add(redPointerMesh);

  var texturePath = THREE.ImageUtils.loadTexture("textures/pointer.png");
  var HUDPointerMaterial = new THREE.MeshBasicMaterial({  map: texturePath });
  HUDPointerMaterial.transparent = true
  HUDPointerMaterial.opacity = 1;
  pointerMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), HUDPointerMaterial);
  pointerMesh.scale.set(20, 20, 1);
  pointerMesh.position.z = -0.01;
  HUDscene.add(pointerMesh);

  // ---- PAUSE STATE STUFF 
  // create text
  // create a canvas element
  var textCanvas = document.createElement('canvas');
  var context = textCanvas.getContext('2d');
  context.font = "Bold 40px Arial";
  context.fillStyle = "rgba(255,0,0,0.95)";
  context.fillText('PAUSE', 0, 50);

  // canvas contents will be used for a texture
  var textTexture = new THREE.Texture(textCanvas) 
  textTexture.needsUpdate = true;

  pauseTextMaterial = new THREE.MeshBasicMaterial( {map: textTexture, side:THREE.DoubleSide } );
  pauseTextMaterial.transparent = true;
  var textMesh = new THREE.Mesh( new THREE.PlaneGeometry(textCanvas.width, textCanvas.height), pauseTextMaterial );
  textMesh.position.z = -0.01;
  HUDscene.add(textMesh);

  //var pauseTexture = THREE.ImageUtils.loadTexture("textures/texture.png");
  HUDPauseMaterial = new THREE.MeshBasicMaterial({ color: "black" });
  HUDPauseMaterial.transparent = true
  HUDPauseMaterial.opacity = 1;
  var HUDPause = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), HUDPauseMaterial);
  HUDPause.scale.set(window.innerWidth*2, window.innerHeight*2, 1);
  HUDPause.position.z = -0.01;

  HUDscene.add(HUDPause);

  // ---

  HUDElementsArray = [HUDSampleMaterial, HUDMinimapMaterial, HUDPointerMaterial, HUDRedPointerMaterial];

  // if the HUD is not visibile, hide it.
  if(!this.HUDisVisible) {
    for (i = 0; i < HUDElementsArray.length; ++i) {
      HUDElementsArray[i].opacity = 0;
    }
  }

};

HUD.prototype.update = function(pause, mapX, mapY, sceneX, sceneZ, pathCameraX, pathCameraZ) {

    // check if the game is in puase or not.
    if(pause) {
      // show pause
      if(HUDPauseMaterial.opacity < 0.5) {
        HUDPauseMaterial.opacity = HUDPauseMaterial.opacity + 0.1;
        pauseTextMaterial.opacity = pauseTextMaterial.opacity + 0.1;
      }
      else {
        HUDPauseMaterial.opacity = 0.5;
        pauseTextMaterial.opacity = 1;
      }
  }
  else {
    // hide pause
    if(HUDPauseMaterial.opacity > 0.1) {
      HUDPauseMaterial.opacity = HUDPauseMaterial.opacity - 0.1;
      pauseTextMaterial.opacity = pauseTextMaterial.opacity - 0.1;
    }
    else {
      HUDPauseMaterial.opacity = 0;
      pauseTextMaterial.opacity = 0;
    }
  }

  updateHUDVisibility(HUDElementsArray);

  // update pointer on minimap
  updatePointerPosition(mapX, mapY, sceneX, sceneZ, pathCameraX, pathCameraZ);
};

function updatePointerPosition(mapX, mapY, sceneX, sceneZ, pathCameraX, pathCameraZ) {
      
      //pointerMesh;
      //console.log("camera: " +camera.position.x);
      //console.log("pointer: " +pointerMesh.position.x);

      pointerMesh.position.x = mapX/3.6 + getPointerXPosition(mapX, sceneX, pathCameraX) *1.45;
      pointerMesh.position.y = -mapY/12.6 + getPointerYPosition(mapY, sceneZ, pathCameraZ) *1.20;

      pointerMesh.updateMatrix();
      pointerMesh.updateMatrixWorld();

      // set the red point (start)
      if(!gotStartingPoint && !isNaN(pointerMesh.position.x)) {

        redPointerMesh.position.x = pointerMesh.position.x;
        redPointerMesh.position.y = pointerMesh.position.y;

        redPointerMesh.updateMatrix();
        redPointerMesh.updateMatrixWorld();

        gotStartingPoint = true;
      }

      if(gotStartingPoint && pointerMesh.position.x != redPointerMesh.position.x)
        hasMoved = true;

      if( (!isNaN(pointerMesh.position.x) && hasMoved)  && Math.floor(pointerMesh.position.x) == Math.floor(redPointerMesh.position.x) && Math.floor(pointerMesh.position.y) == Math.floor(redPointerMesh.position.y)) {
        numLap++;
        console.log(numLap);

        var textCanvas = document.createElement('canvas');
        var context = textCanvas.getContext('2d');
        context.font = "Bold 30px Arial";
        context.fillStyle = "rgba(255, 0, 0, 1)";
        context.fillText("LAP number: " +numLap, 0, 50);

        // canvas contents will be used for a texture
        var textTexture = new THREE.Texture(textCanvas) 
        textTexture.needsUpdate = true;

        var HUDSampleMaterial = new THREE.MeshBasicMaterial({  map: textTexture });
        HUDSampleMaterial.transparent = true
        HUDSampleMaterial.opacity = 1;

        LapCounterMesh.material = HUDSampleMaterial;
      }

      //console.log("pointer: " +pointerMesh.position.x);


}

function getPointerXPosition(mapX, sceneX, pathCameraX) {
  // pointerX : mapX = pathCameraX : sceneX
  return (pathCameraX * mapX) / sceneX;
}

function getPointerYPosition(mapY, sceneZ, pathCameraZ) {
  // pointerX : mapX = pathCameraX : sceneX
  return (pathCameraZ * mapY) / sceneZ;
}

function updateHUDVisibility(HUDElementsArray) {      


  for (i = 0; i < HUDElementsArray.length; ++i) {
     //console.log(HUDElementsArray[i] +"  opacity: " +HUDElementsArray[i].opacity, "is HUD visible ?" +HUDisVisible);

    // HUD fade out
    if(controlGUI.HUDenabled == false && HUDisVisible) {
      if(HUDElementsArray[i].opacity != 0)
        HUDElementsArray[i].opacity = HUDElementsArray[i].opacity - 0.1;

      for(j=0; j<HUDElementsArray.length; j++) {

        if(HUDElementsArray[j].opacity < 0.1) {
          HUDisVisible = false;
          HUDElementsArray[i].opacity = 0;
        }
        else 
           HUDisVisible = true;
      }

    }
    // HUD fade in
    else if (controlGUI.HUDenabled == true && !HUDisVisible) {
      if(HUDElementsArray[i].opacity != 1)
        HUDElementsArray[i].opacity = HUDElementsArray[i].opacity + 0.1;

      for(j=0; j<HUDElementsArray.length; j++) {

        if(HUDElementsArray[j].opacity > 0.9) {
          HUDisVisible = true;
          HUDElementsArray[i].opacity = 1;
        }
        else 
           HUDisVisible = false;
      }
    }
  }

}
