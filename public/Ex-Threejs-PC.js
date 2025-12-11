import * as THREE from 'three'

import { PLYLoader } from './jsm/loaders/PLYLoader.js';
import CustomStats from './Cmp-Stats.js'
import Environment from './Cmp-Environment.js'
import { getFakeLightMaterial, getGradientMaterial } from './utils.js';

const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const environment = new Environment(scene, renderer);
const controls = environment.controls;
const camera = environment.camera; 
environment.loadSkybox("assets/skybox1.png", 300);

const loader = new PLYLoader();
loader.load('./assets/Point-Clouds/Vegetation.ply', geometry => {
    geometry.computeBoundingBox();

    const bbox = geometry.boundingBox;
    const size = new THREE.Vector3();
    bbox.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 100 / maxDim; // normalize to 100 units box

    const center = new THREE.Vector3();
    bbox.getCenter(center);

    // Recenter geometry itself so origin = center
    geometry.translate(-center.x, -center.y, -center.z);

    // Material
    // const material = new THREE.PointsMaterial({
    //     size: 0.1,
    //     vertexColors: geometry.hasAttribute('color'),
    //     color:0x84994f
    // });
    const material = getGradientMaterial();

    const points = new THREE.Points(geometry, material);

    // Wrap in group for scaling/rotation
    const group = new THREE.Group();
    group.add(points);

    // Scale cloud
    group.scale.set(scale, scale, scale);

    // Rotate safely (now pivot is at the true center)
    group.rotation.x = -1 * Math.PI / 2;

    scene.add(group);

    // Helper on recentered geometry
    const newBbox = new THREE.Box3().setFromObject(group);
    const helper = new THREE.Box3Helper(newBbox, 0xff0000);
    scene.add(helper);
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
