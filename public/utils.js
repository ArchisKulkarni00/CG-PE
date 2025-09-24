import * as THREE from 'three'

export function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

export function addToPotree(scene, object){
    // object.rotation.x = Math.PI/2;
    scene.add(object); 
}

export function getGradientMaterial(){
  const vertexShader = `
    varying float vHeight;

    void main() {
      vHeight = position.z;  // pass y position to fragment shader
      gl_PointSize = 3.0;    // adjust size as needed
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying float vHeight;

    void main() {
      // normalize height to [0,1] range for gradient
      float h = (vHeight + 50.0) / 100.0;  
      vec3 lowColor = vec3(0.0, 0.3, 0.0);   // dark green
      vec3 highColor = vec3(0.3, 1.0, 0.3);  // bright green
      vec3 color = mix(lowColor, highColor, clamp(h, 0.0, 1.0));

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
  });

}

export function getFakeLightMaterial(sunlight){

  const vertexShader = `
    varying vec3 vWorldPos;

    void main() {
      // transform local position into world space
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_PointSize = 3.0;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uLightPos;
    varying vec3 vWorldPos;

    void main() {
      // fake normal = point position direction
      vec3 lightDir = normalize(uLightPos - vWorldPos);

      // intensity depends on facing "lightDir"
      float intensity = dot(normalize(vWorldPos), lightDir);
      intensity = clamp(intensity, 0.2, 1.0); // keep it visible

      vec3 baseColor = vec3(0.0, 0.8, 0.0); // green
      vec3 color = baseColor * intensity;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms: {
      uLightPos: { value: sunlight }
    },
    vertexShader,
    fragmentShader,
  });

}