import * as THREE from "three";
import { ImprovedNoise } from './jsm/math/ImprovedNoise.js';
import { MTLLoader } from './jsm/loaders/MTLLoader.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';

export default class TileCityRealistic {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Options
    const {
      tileSize = 1,        // world size per cell (meters/units)
      rows = 10,            // grid rows per tile
      cols = 10,            // grid cols per tile
      roadProbability = 0.2,// chance per row/col to become a road
      randomHeights = true, // randomize building heights
      minHeight = 0.2,
      maxHeight = 3,
      randomFootprint = true, // randomize building x/z scale
      minScaleXZ = 0.5,
      maxScaleXZ = 1.0,
      roadLift = 0.05,      // lift roads slightly to avoid z-fighting
      maxBuildings = 30,
    } = opts;

    this.opts = {
      tileSize, rows, cols, roadProbability,
      randomHeights, minHeight, maxHeight,
      randomFootprint, minScaleXZ, maxScaleXZ, roadLift, maxBuildings
    };

    // Ground plane (as-is)
    const groundPlaneSize = Math.max(rows, cols) * tileSize;
    const groundGeo = new THREE.PlaneGeometry();
    groundGeo.rotateX(3 * Math.PI / 2);
    groundGeo.scale(groundPlaneSize, 1, groundPlaneSize);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0x005500 });
    const groundPlane = new THREE.Mesh(groundGeo, groundMat);
    groundPlane.receiveShadow = true;
    groundPlane.castShadow = true;
    this.group.add(groundPlane);

    // Internal buffers
    this.roadGrid = null;      // 2D array [rows][cols] = 1 road | 0 none
    this.buildingGrid = null;  // complement of roadGrid
    this.roadsIMesh = null;    // InstancedMesh for roads
    this.buildingsIMesh = null;// InstancedMesh for buildings

    this.noise = new ImprovedNoise();
    this.noiseScale = 0.3; // controls how spread out districts are
    this.seed = Math.random() * 100; // randomize city layout
  }

  // Public API to position the whole tile in world space
  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  // Generate the road / building grids and produce instanced meshes
  generate() {
    const { rows, cols, maxBuildings, roadProbability } = this.opts;
    // STEP 1: Generate roads grid (O(rows+cols) selection, O(rows*cols) fill)
    // Assuming _generateRoadsAndBuildings returns an object with these properties
    ({ roadGrid: this.roadGrid, buildingGrid: this.buildingGrid, buildingCount: this.buildingCount } = this._generateRoadsAndBuildings(rows, cols, roadProbability, maxBuildings));

    console.log(this.buildingCount)
    // STEP 3: Create instanced meshes
    if (this.roadsIMesh) this.group.remove(this.roadsIMesh);
    if (this.buildingsIMesh) this.group.remove(this.buildingsIMesh);

    this.roadsIMesh = this._createRoadInstancedMesh(this.roadGrid);
    this.buildingsIMesh = this._createBuildingInstancedMesh(this.buildingGrid);

    // this.group.add(this.roadsIMesh);
    // this.group.add(this.buildingsIMesh);
  }

  // Efficient random road picker: choose rows & columns stochastically
  // Fused generation: builds roads and capped buildings in one pass
// Returns { roadGrid, buildingGrid, buildingCount }
_generateRoadsAndBuildings(rows, cols, roadProbability, maxBuildings = Infinity) {
    // 1) Select road rows/cols once
    const roadRows = new Set();
    const roadCols = new Set();
    for (let r = 0; r < rows; r++) {
        if (Math.random() < roadProbability) roadRows.add(r);
    }
    for (let c = 0; c < cols; c++) {
        if (Math.random() < roadProbability) roadCols.add(c);
    }
    if (roadRows.size === 0) roadRows.add((rows / 2) | 0);
    if (roadCols.size === 0) roadCols.add((cols / 2) | 0);

    // 2) Allocate output grids
    const roadGrid = new Array(rows);
    const buildingGrid = new Array(rows);
    for (let r = 0; r < rows; r++) {
        roadGrid[r] = new Uint8Array(cols);
        buildingGrid[r] = new Uint8Array(cols);
    }

    // 3) Single sweep: fill roadGrid and reservoir-sample building cells
    // Reservoir for uniformly sampling up to maxBuildings from unknown total vacant cells
    // Each entry stores a linear index i = r*cols + c
    const reservoir = [];
    let seenVacant = 0;

    for (let r = 0; r < rows; r++) {
        const rr = roadRows.has(r);
        const rgRow = roadGrid[r];
        const bgRow = buildingGrid[r];

        for (let c = 0; c < cols; c++) {
        const isRoad = rr || roadCols.has(c);
        rgRow[c] = isRoad ? 1 : 0;

        if (!isRoad) {
            // vacant candidate for building
            if (maxBuildings > 0) {
            const linear = r * cols + c;
            if (reservoir.length < maxBuildings) {
                reservoir.push(linear);
            } else {
                // reservoir sampling replacement
                const j = Math.floor(Math.random() * (seenVacant + 1));
                if (j < maxBuildings) reservoir[j] = linear;
            }
            }
            seenVacant++;
        }
        }
    }

    // 4) Mark selected building cells in buildingGrid
    for (let k = 0; k < reservoir.length; k++) {
        const idx = reservoir[k];
        const r = (idx / cols) | 0;
        const c = idx - r * cols;
        buildingGrid[r][c] = 1;
    }

    return {
        roadGrid,
        buildingGrid,
        buildingCount: reservoir.length
    };
  }

    // Helper: load one OBJ+MTL pair and return a normalized Group
  async loadObjMtl(pathBase, nameBase) {
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();

    mtlLoader.setResourcePath(`${pathBase}/`).setPath(`${pathBase}/`);
    const mtl = await new Promise((res, rej) =>
      mtlLoader.load(`${nameBase}.mtl`, (m) => { m.preload(); res(m); }, undefined, rej)
    );
    objLoader.setMaterials(mtl).setPath(`${pathBase}/`);

    const obj = await new Promise((res, rej) =>
      objLoader.load(`${nameBase}.obj`, res, undefined, rej)
    );

    obj.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = child.receiveShadow = true;
      }
    });

    return obj;
  }

  async _ensureRoadAssets() {
    if (!this._roadAssets) {
      const base = `${this.basePath || '.'}/assets/3D-models`;
      const names = [
        'Road'
      ];
      this._roadAssets = await Promise.all(names.map(n => this.loadObjMtl(base, n)));
    }

    return this._roadAssets;
  }


  async _createRoadInstancedMesh(roadGrid) {
    const { tileSize, roadLift } = this.opts;
    const rows = roadGrid.length;
    const cols = roadGrid[0].length;

    // Count instances
    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (roadGrid[r][c] === 1) count++;
      }
    }

    if (count === 0) {
      // No roads -> return an empty InstancedMesh with 1 dummy instance to keep API stable
      const geom = new THREE.PlaneGeometry(tileSize, tileSize);
      geom.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({ color: 0x555555, visible: false });
      const imesh = new THREE.InstancedMesh(geom, mat, 1);
      return imesh;
    }

    const asset = await this._ensureRoadAssets();
    // Clone geometry and material so instancing works
    const roadAsset = asset[0].children[0];
    const geometry = roadAsset.geometry.clone();
    const material = roadAsset.material.clone();
    material.shininess = 2;
    
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    instancedMesh.castShadow = false;
    instancedMesh.receiveShadow = true;
    console.log(instancedMesh);

    const matrix = new THREE.Matrix4();
    let i = 0;
    // Center grid on tile origin by offsetting positions around (0,0)
    const x0 = -((cols - 1) * tileSize) / 2;
    const z0 = -((rows - 1) * tileSize) / 2;

    let roadCount = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (roadGrid[r][c] !== 1) continue;
        const x = x0 + c * tileSize;
        const z = z0 + r * tileSize;
        matrix.makeTranslation(x, roadLift, z);
        instancedMesh.setMatrixAt(i++, matrix);
        roadCount++;
      }
    }
    console.log(roadCount);
    this.group.add(instancedMesh);
  }


  // Cache models once
  async _ensureBuildingAssets() {
    if (!this._buildingAssets) {
      const base = `${this.basePath || '.'}/assets/3D-models`;
      const names = [
        'Buildings_001','Buildings_002','Buildings_003',
        'Buildings_004','Buildings_005','Buildings_006','Buildings_007'
      ];
      this._buildingAssets = await Promise.all(names.map(n => this.loadObjMtl(base, n)));
    }
    const objectScaleCorrection = 5;
    this._buildingAssets.forEach(obj => {
      obj.traverse(child => {
        if (child.isMesh) {
          child.scale.set(objectScaleCorrection, objectScaleCorrection, objectScaleCorrection);
        }
      });
    });
    return this._buildingAssets;
  }

  // Place building models instead of instanced boxes
  async _createBuildingInstancedMesh(buildingGrid) {
    const { tileSize, randomHeights, minHeight, maxHeight,
            randomFootprint, minScaleXZ, maxScaleXZ } = this.opts;

    const rows = buildingGrid.length, cols = buildingGrid[0].length;
    const assets = await this._ensureBuildingAssets();

    const group = new THREE.Group();
    const tmpMatrix = new THREE.Matrix4();
    const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), scale = new THREE.Vector3();

    const x0 = -((cols - 1) * tileSize) / 2;
    const z0 = -((rows - 1) * tileSize) / 2;

    let buildingCount = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (buildingGrid[r][c] !== 1) continue;

        const x = x0 + c * tileSize;
        const z = z0 + r * tileSize;

        // Footprint
        const sx = (randomFootprint
          ? THREE.MathUtils.lerp(minScaleXZ, maxScaleXZ, Math.random())
          : 0.8) * tileSize;

        const sz = (randomFootprint
          ? THREE.MathUtils.lerp(minScaleXZ, maxScaleXZ, Math.random())
          : 0.8) * tileSize;

        // Height (noise-biased)
        const noiseVal = (this.noise.noise(c * this.noiseScale + this.seed, r * this.noiseScale + this.seed, 0) + 1) / 2;
        const biasedVal = Math.pow(noiseVal, 5.0);
        const sy = randomHeights
          ? THREE.MathUtils.lerp(minHeight, maxHeight, biasedVal)
          : minHeight;

        // Clone random building asset
        const proto = assets[Math.floor(Math.random() * assets.length)];
        const building = proto.clone(true);
        console.log(building);
        building.children[0].material.shininess = 2;


        // Transform
        pos.set(x, 0, z);
        quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
        scale.set(sx, sy, sz);

        tmpMatrix.compose(pos, quat, scale);
        building.matrix.copy(tmpMatrix);
        building.matrixAutoUpdate = false;

        group.add(building);
        buildingCount++;
      }
    }

    // Store reference + attach
    console.log(buildingCount);
    this.group.add(group);
  }

}
