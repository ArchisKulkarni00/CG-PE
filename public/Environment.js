import * as THREE from 'three';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import Skybox from './Skybox.js';

export default class Environment {
  constructor(scene, renderer) {
    this.scene = scene;

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    this.camera.position.set(2, 2, 2);

    // Renderer
    this.renderer = renderer;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Lights
    this.skyLight = new THREE.HemisphereLight(0x039dff, 0x080820, 1);
    this.scene.add(this.skyLight);

    this.ambientLight = new THREE.AmbientLight(0x222222);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffffcc, 5);
    this.sunLight.position.set(50, 50, 0);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 100;
    this.sunLight.shadow.camera.left = -50;
    this.sunLight.shadow.camera.right = 50;
    this.sunLight.shadow.camera.top = 50;
    this.sunLight.shadow.camera.bottom = -50;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.scene.add(this.sunLight);

    // Helpers
    this.lightHelper = new THREE.DirectionalLightHelper(this.sunLight, 1);
    this.scene.add(this.lightHelper);
    this.cameraHelper = new THREE.CameraHelper(this.sunLight.shadow.camera);
    this.scene.add(this.cameraHelper);

    // Skybox placeholder
    this.skybox = null;
  }

  setCamera(fov, aspect, near, far) {
    this.camera.fov = fov;
    this.camera.aspect = aspect;
    this.camera.near = near;
    this.camera.far = far;
    this.camera.updateProjectionMatrix();
  }

  toggleLight(lightName, state) {
    if (this[lightName]) {
      this[lightName].visible = state;
    }
  }

  toggleShadows(state) {
    this.renderer.shadowMap.enabled = state;
    this.sunLight.castShadow = state;
  }

  loadSkybox(texturePath, size = 300) {
    this.skybox = new Skybox(texturePath, size);
    this.skybox.load((mesh) => {
      this.scene.add(mesh);
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
