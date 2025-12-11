import * as THREE from 'three';
import Skybox from "./Cmp-Skybox.js";
import TileCityRealistic from './Cmp-TileCityRealistic.js'
import { addToPotree } from './utils.js';

// POTREE INIT CODE
window.viewer = new Potree.Viewer(document.getElementById("potree_render_area"));

viewer.setEDLEnabled(true);
viewer.setFOV(75);
viewer.setPointBudget(1_000_000);
viewer.loadSettingsFromURL();

viewer.setDescription("");

viewer.loadGUI(() => {
    viewer.setLanguage('en');
    $("#menu_appearance").next().show();
    //viewer.toggleSidebar();
});

// VISUALIZER CODE

const PotreeScene = viewer.scene.scene;
PotreeScene.rotation.x = Math.PI / 2;
console.log(viewer.scene.scene);

const skyLight = new THREE.HemisphereLight( 0x039DFF, 0x080820, 1 );
addToPotree(PotreeScene, skyLight);

const light = new THREE.AmbientLight( 0x222222 );
addToPotree( PotreeScene, light );

const sunLight = new THREE.DirectionalLight( 0xffffcc, 5 );
sunLight.position.set(5,5,0);
sunLight.castShadow = true;
addToPotree( PotreeScene, sunLight );
const helper = new THREE.DirectionalLightHelper(sunLight, 1);
addToPotree(PotreeScene,helper);

const skybox = new Skybox("assets/skybox1.png", 300);

skybox.load((mesh) => {
  // mesh.rotation.x = Math.PI / 2;
  addToPotree(PotreeScene,mesh);
});

const tileE = new TileCityRealistic(PotreeScene, {
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
// tileE.setRotation(Math.PI/2, 0, 0);
tileE.generate();

const cone = new THREE.ConeGeometry();
const coneMesh = new THREE.Mesh(cone);
// coneMesh.rotation.x = Math.PI / 2;
addToPotree(PotreeScene, coneMesh);

// ADDING POINT CLOUD

// Lion
Potree.loadPointCloud("./assets/Point-Clouds/lion_takanawa/cloud.js", "lion", function(e){
    viewer.scene.addPointCloud(e.pointcloud);
    
    let material = e.pointcloud.material;
    material.size = 1;
    material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
    
    viewer.fitToScreen();
});