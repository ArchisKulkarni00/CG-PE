import * as THREE from 'three'

import TileCityRealistic from './TileCityRealistic.js'
import CustomStats from './Stats.js'

import { Potree } from './potree-core/dist/index.js'
import Environment from './Environment.js'

const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const environment = new Environment(scene, renderer);
const controls = environment.controls;
const camera = environment.camera; 
environment.loadSkybox("assets/skybox1.png", 300);


const tileE = new TileCityRealistic(scene, {
  tileSize: 1,
  rows: 100,
  cols: 100,
  roadProbability: 0.25,
  randomHeights: true,
  minHeight: 0.3,
  maxHeight: 5,
  randomFootprint: true,
  minScaleXZ: 0.4,
  maxScaleXZ: 0.9,
  roadLift: 0.03,
  maxBuildings: 5000
});
tileE.setPosition(0, 0, 0);
tileE.generate();

const pointClouds = [];
const baseUrl = "./potree/pointclouds/lion_takanawa/";
const potree = new Potree();
potree.loadPointCloud("cloud.js", baseUrl,).then(function(pco) {
  pco.material.size = 1.0;
  pco.material.shape = 5;
  pco.material.inputColorEncoding = 1;
  pco.material.outputColorEncoding = 1;
  pco.rotation.x = -Math.PI/2;
  pco.position.set(0,1,0);
  scene.add(pco);
	pointClouds.push(pco);
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
