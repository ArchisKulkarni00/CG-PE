import * as THREE from 'three'

import CustomStats from './Cmp-Stats.js'

import { Potree } from './potree-core/dist/index.js'
import Environment from './Cmp-Environment.js'
import UIPanel from './Cmp-UI.js'

const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const environment = new Environment(scene, renderer);
const controls = environment.controls;
const camera = environment.camera; 
environment.loadSkybox("assets/skybox1.png", 300);


const pointClouds = [];
const baseUrl = "./converted/AHN-4-Classified/";
const potree = new Potree();
potree.loadPointCloud("metadata.json", baseUrl,).then(function(pco) {

  // Get bounding box from Potree cloud
  const bbox = pco.boundingBox.clone();

  const size = new THREE.Vector3();
  bbox.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const geometryLimit = 200;
  const scale = geometryLimit / maxDim;

  // const center = new THREE.Vector3();
  // bbox.getCenter(center);

  pco.position.set(-geometryLimit/2,0,geometryLimit/2);
  pco.scale.set(scale, scale, scale);

  pco.material.size = 7.0;
  pco.material.shape = 5;
  pco.material.inputColorEncoding = 1;
  pco.material.outputColorEncoding = 1;
  pco.rotation.x = -Math.PI/2;
  scene.add(pco);
	pointClouds.push(pco);
  console.log(scene);
});


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
// stats.showAllPanels();

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
