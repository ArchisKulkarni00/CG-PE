import * as THREE from 'three'
import { OrbitControls } from './jsm/controls/OrbitControls.js'
import Stats from './jsm/libs/stats.module.js'

import TileCollection from './TileCollection.js'
import Skybox from './Skybox.js'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500)
camera.position.x = 2
camera.position.y = 2
camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

const skyLight = new THREE.HemisphereLight( 0x039DFF, 0x080820, 2 );
scene.add( skyLight );

const light = new THREE.AmbientLight( 0x222222 );
scene.add( light );

// const sunLight = new THREE.DirectionalLight( 0xffff00, 20 );
// const sunTarget = new THREE.Object3D(); 
// sunTarget.position.set(5,0,0);
// scene.add(sunTarget);
// sunLight.position.set(-5,5,0);
// sunLight.castShadow = true;
// sunLight.target = sunTarget;
// scene.add( sunLight );
// const helper = new THREE.DirectionalLightHelper(sunLight, 1);
// scene.add(helper);

const skybox = new Skybox("assets/skybox1.png", 300);

skybox.load((mesh) => {
  scene.add(mesh);
  console.log(mesh);
});

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

const stats = Stats()
document.body.appendChild(stats.dom)


function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()
