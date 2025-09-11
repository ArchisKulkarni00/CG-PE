export function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

export function addToPotree(scene, object){
    // object.rotation.x = Math.PI/2;
    scene.add(object); 
}