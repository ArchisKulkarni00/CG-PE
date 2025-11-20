import * as THREE from 'three'

import TileCityRealistic from './Cmp-TileCityRealistic.js'
import CustomStats from './Cmp-Stats.js'

import { Potree } from './potree-core/dist/index.js'
import Environment from './Cmp-Environment.js'
import { OBJLoader } from './jsm/loaders/OBJLoader.js';
import { MTLLoader } from './jsm/loaders/MTLLoader.js';

const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const environment = new Environment(scene, renderer);
const controls = environment.controls;
const camera = environment.camera; 
environment.loadSkybox("assets/skybox1.png", 300);


const pointClouds = [];
const baseUrl = "./converted/AHN-NoBuilding/";
const potree = new Potree();

let pointCloud = null;
let buildingMesh = null;
let citySceneGroup = new THREE.Group();

const objPath = "./assets/3D-models/10-398-980-LoD22-3D.obj"; // your co-registered OBJ model
const mtlPath = "./assets/3D-models/10-398-980-LoD22-3D.obj.mtl"; // your co-registered OBJ model

potree.loadPointCloud("metadata.json", baseUrl).then(function(pco) {

  pco.material.size = 7.0;
  pco.material.shape = 5;
  pco.material.inputColorEncoding = 1;
  pco.material.outputColorEncoding = 1;

  pointCloud = pco;
  pointClouds.push(pco);
  console.log("Point cloud loaded:", pointCloud);

  tryAlign();


});

const mtlLoader = new MTLLoader();

mtlLoader.load(mtlPath, (materials) => {
  
  materials.preload();  // VERY IMPORTANT

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);

  objLoader.load(objPath, (object) => {

    buildingMesh = object;
    console.log("OBJ + MTL loaded:", object);

    tryAlign();
  });

});

function centerMeshGroup(meshGroup) {
  const bbox = new THREE.Box3().setFromObject(meshGroup);
  const center = new THREE.Vector3();
  bbox.getCenter(center);

  meshGroup.traverse(child => {
    if (child.isMesh && child.geometry) {
      child.geometry.computeBoundingBox();
      child.geometry.translate(-center.x, -center.y, -center.z);
    }
  });

  // Reset group position (children are already recentered)
  meshGroup.position.set(0, 0, 0);

  return center;
}


function tryAlign() {
  if (!pointCloud || !buildingMesh) return;

  // --- STEP 1: Store original centers (before modifying geometry) ---
  const originalCloudCenter = pointCloud.boundingBox.getCenter(new THREE.Vector3());
  
  let meshBox = new THREE.Box3().setFromObject(buildingMesh);
  const originalMeshCenter = meshBox.getCenter(new THREE.Vector3());

  // --- STEP 2: RECENTER BOTH DATASETS TO ORIGIN ---
  centerMeshGroup(buildingMesh);

  // --- STEP 3: Compute relation vector in normalized space ---
  const relationVec = new THREE.Vector3().subVectors(
    originalMeshCenter,
    originalCloudCenter
  );

  console.log("cloud",originalCloudCenter);
  console.log("mesh",originalMeshCenter);
  console.log("relation",relationVec);

  // --- STEP 4: Scale based on cloud size ---
  const cloudSize = new THREE.Vector3();
  pointCloud.boundingBox.getSize(cloudSize);

  const maxDim = Math.max(cloudSize.x, cloudSize.y, cloudSize.z);
  const scale = 200 / maxDim;

  pointCloud.scale.setScalar(scale);
  pointCloud.rotation.x = -Math.PI / 2;
  pointCloud.position.set(-80, 0, 100);
  buildingMesh.scale.setScalar(scale);
  buildingMesh.rotation.x = -Math.PI / 2;
  buildingMesh.position.set(-24.49,1.416,-41.23);


  // --- STEP 7: Add to scene ---
  scene.add(pointCloud);
  scene.add(buildingMesh);

  console.log("Alignment complete", scene);
}




window.addEventListener(
    'resize',
    function () {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        render()
    },
    false
)


const stats = new CustomStats();
stats.showAllPanels();

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    stats.updateAll();
    potree.updatePointClouds(pointClouds, camera, renderer);
    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()
