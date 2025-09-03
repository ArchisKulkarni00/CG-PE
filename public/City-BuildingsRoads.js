import * as THREE from 'three'
import { OrbitControls } from './jsm/controls/OrbitControls.js'

import Skybox from './Skybox.js'
import TileCity from './TileCity.js'
import CustomStats from './Stats.js'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500)
camera.position.x = 2
camera.position.y = 2
camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

const skyLight = new THREE.HemisphereLight( 0x039DFF, 0x080820, 1 );
scene.add( skyLight );

const light = new THREE.AmbientLight( 0x222222 );
scene.add( light );

const sunLight = new THREE.DirectionalLight( 0xffff00, 50 );
// const sunTarget = new THREE.Object3D(); 
// sunTarget.position.set(0,10,0);
// scene.add(sunTarget);
sunLight.position.set(5,5,0);
sunLight.castShadow = true;
// sunLight.target = sunTarget;
scene.add( sunLight );
const helper = new THREE.DirectionalLightHelper(sunLight, 1);
scene.add(helper);

const skybox = new Skybox("assets/skybox1.png", 300);

skybox.load((mesh) => {
  scene.add(mesh);
  console.log(mesh);
});

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
