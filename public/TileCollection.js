import Tile from "./Tile.js";

export default class TileCollection {
  constructor(scene, tileSize = 10) {
    this.scene = scene;
    this.tileSize = tileSize;
    this.tiles = {};
  }

  async addTile(i, j, url, numBuildings = 10) {
    const tile = new Tile(this.scene);
    await tile.loadMap(url, numBuildings);
    tile.group.position.set(i * this.tileSize, 0, j * this.tileSize);
    this.tiles[`${i},${j}`] = tile;
  }
}
