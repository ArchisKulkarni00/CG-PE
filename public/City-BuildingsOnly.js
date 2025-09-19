import * as THREE from 'three'

import TileCollection from './TileCollection.js'
import CustomStats from './Stats.js'
import Environment from './Environment.js'

const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const environment = new Environment(scene, renderer);
const controls = environment.controls;
const camera = environment.camera; 
environment.loadSkybox("assets/skybox1.png", 300);


const tilesCollection = new TileCollection(scene);
for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
        tilesCollection.addTile(i,j,null, 25);
    }
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
    render()
    stats.updateAll()
}

function render() {
    renderer.render(scene, camera)
}

animate()
