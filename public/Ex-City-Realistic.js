import * as THREE from 'three'

import TileCityRealistic from './Cmp-TileCityRealistic.js'
import CustomStats from './Cmp-Stats.js'
import Environment from './Cmp-Environment.js'

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

// const stats = Stats()
// stats.showPanel(0)
// stats.dom.style.position = 'absolute';
// stats.dom.style.top = '0px';
// stats.dom.style.left = '0px';
// document.body.appendChild(stats.dom)

// const stats1 = Stats()
// stats1.showPanel(1)
// stats1.dom.style.position = 'absolute';
// stats1.dom.style.top = '50px';
// stats1.dom.style.left = '0px';
// document.body.appendChild(stats1.dom)

const stats = new CustomStats();
stats.showAllPanels();

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
    // stats.update()
    // stats1.update()
    stats.updateAll();
}

function render() {
    renderer.render(scene, camera)
}

animate()
