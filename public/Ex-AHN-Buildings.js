import * as THREE from 'three'

import TileCityRealistic from './Cmp-TileCityRealistic.js'
import CustomStats from './Cmp-Stats.js'

import { Potree } from './potree-core/dist/index.js'
import Environment from './Cmp-Environment.js'
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

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

const glbPath = "./assets/3D-models/city_merged.glb"; // your exported GLB model

const loader = new GLTFLoader();
loader.load(
  glbPath,
  function (gltf) {
    const buildingModel = gltf.scene.children[0].children[0];

    // Compute bounding box of the GLB
    const bbox = new THREE.Box3().setFromObject(buildingModel);
    const temp_size = new THREE.Vector3();
    bbox.getSize(temp_size);
    const size = new THREE.Vector3(temp_size.x, temp_size.z, temp_size.y);

    // Get the largest dimension
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 200; // Match point cloud scale
    const scale = targetSize / maxDim;
    console.log('mesh scale: ', scale);

    // Get center of the model and re-center it
    buildingModel.geometry.computeBoundingBox();
    const geoCenter = new THREE.Vector3();
    buildingModel.geometry.boundingBox.getCenter(geoCenter);
    // Move vertices so that geometry is centered around the origin
    buildingModel.geometry.translate(-geoCenter.x, -geoCenter.y, 0);
    
    // Apply transforms
    buildingModel.scale.set(scale, scale, scale);
    buildingModel.rotation.x = -Math.PI / 2; // Match point cloud orientation
    buildingModel.position.y = 0; // Keep it on ground level

    // Optional: Material tweaks for visibility
    buildingModel.traverse((child) => {
      if (child.isMesh) {
        child.material.side = THREE.DoubleSide;
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.transparent = false;
      }
    });

    // Add to scene
    scene.add(buildingModel);
    buildingMesh = buildingModel;

    tryAlign();

    console.log("GLB model loaded and normalized:", buildingModel);
  },
  undefined,
  function (error) {
    console.error("Error loading GLB:", error);
  }
);

potree.loadPointCloud("metadata.json", baseUrl).then(function(pco) {

  // --- Existing Point Cloud Setup ---
  const bbox = pco.boundingBox.clone();
  const size = new THREE.Vector3();
  bbox.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const geometryLimit = 200; // target visualization size
  const scale = geometryLimit / maxDim;
  console.log('pco scale: ', scale);

  pco.position.set(-geometryLimit/2, 0, geometryLimit/2);
  pco.scale.set(scale, scale, scale);
  pco.rotation.x = -Math.PI / 2;

  pco.material.size = 7.0;
  pco.material.shape = 5;
  pco.material.inputColorEncoding = 1;
  pco.material.outputColorEncoding = 1;

  scene.add(pco);
  pointCloud = pco;
  pointClouds.push(pco);

  tryAlign();

  console.log("Point cloud loaded:", scene);

});

function tryAlign() {
  if (!pointCloud || !buildingMesh) return; // Wait until both loaded

  // pointCloud.updateMatrixWorld(true);
  // buildingMesh.updateMatrixWorld(true);

  // // Once both are loaded — compute bounding boxes and align
  const boxCloud = new THREE.Box3().setFromObject(pointCloud);
  const boxMesh  = new THREE.Box3().setFromObject(buildingMesh);

  console.log('cloud bbox:', boxCloud);
  console.log('mesh bbox:', boxMesh);

  // const centerCloud = new THREE.Vector3();
  // const centerMesh  = new THREE.Vector3();

  // boxCloud.getCenter(centerCloud);
  // boxMesh.getCenter(centerMesh);

  // const offset = new THREE.Vector3().subVectors(centerCloud, centerMesh);
  // console.log('offset:', offset);
  const centerMesh = new THREE.Vector3(-20,0,0);
  buildingMesh.position.add(centerMesh);
  buildingMesh.position.y = 0;

  // console.log("Aligned GLB to point cloud with offset:", offset);
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
