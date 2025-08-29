import * as THREE from 'three'


export default class RoadNetwork {
  constructor(rows, cols, tileSize = 10, roadProbability = 0.2) {
    this.rows = rows;
    this.cols = cols;
    this.tileSize = tileSize;
    this.roadProbability = roadProbability;

    this.grid = []; // 2D array: 0 = building, 1 = road
    this.generateRoads();
  }

  generateRoads() {
    // Pick rows and cols for roads
    const roadRows = new Set();
    const roadCols = new Set();

    for (let r = 0; r < this.rows; r++) {
      if (Math.random() < this.roadProbability) {
        roadRows.add(r);
      }
    }

    for (let c = 0; c < this.cols; c++) {
      if (Math.random() < this.roadProbability) {
        roadCols.add(c);
      }
    }

    // Build grid
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      for (let c = 0; c < this.cols; c++) {
        if (roadRows.has(r) || roadCols.has(c)) {
          row.push(1); // road
        } else {
          row.push(0); // building
        }
      }
      this.grid.push(row);
    }
  }

  createRoadMeshes() {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: 0x333333 });

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === 1) {
          const geometry = new THREE.PlaneGeometry(this.tileSize, this.tileSize);
          const plane = new THREE.Mesh(geometry, material);
          plane.rotation.x = -Math.PI / 2; // flat on ground
          plane.position.set(
            c * this.tileSize,
            0,
            r * this.tileSize
          );
          group.add(plane);
        }
      }
    }
    group.translateY(0.05);
    return group;
  }
}
