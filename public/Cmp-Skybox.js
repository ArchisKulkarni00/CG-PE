import * as THREE from 'three'


export default class Skybox {
  constructor(texturePath, radius = 500) {
    this.texturePath = texturePath;
    this.radius = radius;
    this.mesh = null;
  }

  load(onLoad) {
    const loader = new THREE.TextureLoader();
    loader.load(this.texturePath, (texture) => {
    //   texture.mapping = THREE.EquirectangularReflectionMapping;
    //   texture.magFilter = THREE.LinearFilter;
    //   texture.minFilter = THREE.LinearMipMapLinearFilter;

      const geometry = new THREE.SphereGeometry(this.radius, 60, 40);
    //   geometry.scale(-1, 1, 1); // invert so texture is on the inside

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide
      });

      this.mesh = new THREE.Mesh(geometry, material);

      if (onLoad) onLoad(this.mesh); // callback with the mesh
    });
  }

  getMesh() {
    return this.mesh;
  }
}
