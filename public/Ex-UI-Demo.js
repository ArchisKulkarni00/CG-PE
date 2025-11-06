import * as THREE from 'three'

import CustomStats from './Cmp-Stats.js'

import { Potree } from './potree-core/dist/index.js'
import Environment from './Cmp-Environment.js'
import generateSceneHierarchy from './Cmp-UI.js'
import TileCity from './Cmp-TileCity.js'

const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const environment = new Environment(scene, renderer);
const controls = environment.controls;
const camera = environment.camera; 
environment.loadSkybox("assets/skybox1.png", 300);

const tileE = new TileCity(scene, {
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

generateSceneHierarchy(scene);

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    stats.updateAll();
    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()
