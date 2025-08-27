import * as THREE from "three";

export default class Tile {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.coords = [];

    // Create a group for this tile
    this.group = new THREE.Group();
    this.scene.add(this.group);

    const groundPlaneSize = 10;
    const geometry = new THREE.PlaneGeometry();
    geometry.rotateX(3 * Math.PI / 2);
    geometry.scale(groundPlaneSize, 1, groundPlaneSize);

    const material = new THREE.MeshStandardMaterial({
      color: 0x00FF00,
    });

    const groundPlane = new THREE.Mesh(geometry, material);
    groundPlane.receiveShadow = true;
    groundPlane.castShadow = true;

    this.group.add(groundPlane);
  }

  // Load the grid file and return coordinates of 1s
  async loadMap(url = null, numBuildings = 10) {
    this.coords = []; // reset coords

    if (url) {
        // Load from map file
        const response = await fetch(url);
        const text = await response.text();
        const lines = text.trim().split("\n");

        const numRows = lines.length;
        const numCols = lines[0].trim().split(/\s+/).length;

        const rowOffset = Math.floor(numRows / 2);
        const colOffset = Math.floor(numCols / 2);

        for (let row = 0; row < numRows; row++) {
        const cols = lines[row].trim().split(/\s+/);
        for (let col = 0; col < numCols; col++) {
            if (cols[col] === "1") {
            this.coords.push([row - rowOffset, col - colOffset]);
            }
        }
        }
    } else {
        // Generate random building coordinates
        const range = 10; // adjust spread of buildings
        const rowOffset = 5;
        const colOffset = 5;
        for (let i = 0; i < numBuildings; i++) {
        const row = Math.floor(Math.random() * range - rowOffset);
        const col = Math.floor(Math.random() * range - colOffset);
        this.coords.push([row, col]);
        }
    }
    this.createBuildings();
}


  // Create 3D buildings from coordinates
  createBuildings(boxSize = 1) {
    const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });

    const count = this.coords.length;
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

    const dummy = new THREE.Object3D();

    this.coords.forEach(([row, col], i) => {
      // Random scales
      const heightScale = Math.random() + 0.5;
      const xScale = (Math.random() + 0.5) / 2;
      const zScale = (Math.random() + 0.5) / 2;

      const halfHeight = (boxSize * heightScale) / 2;

      // Setup dummy transform
      dummy.position.set(col * boxSize, halfHeight, row * boxSize);
      dummy.scale.set(xScale, heightScale, zScale);

      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    });

    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    this.group.add(instancedMesh);
    this.buildings = instancedMesh; // store mesh, not array
  }


  // ✅ New: Move the whole tile
  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }
}
