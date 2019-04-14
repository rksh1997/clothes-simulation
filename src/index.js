import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  Color,
  Fog,
  DoubleSide,
  PointLight,
  MeshLambertMaterial,
  Vector3
} from 'three';

import Cloth from './Cloth';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const scene = new Scene();
scene.background = new Color(0xcce0ff);
scene.fog = new Fog(0xcce0ff, 500, 10000);

const camera = new PerspectiveCamera(60, WIDTH / HEIGHT, 0.1, 100);
camera.position.set(0, 2.5, 10)
camera.lookAt(0, 0, 0);

const pointLight = new PointLight(0xdddddd);
pointLight.position.copy(camera.position)
scene.add(pointLight);

const renderer = new WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);

let lastFrameTimeMs = 0;
let maxFPS = 60;
let delta = 0;
let timestep = 1000 / maxFPS;

const num = 10 * 2

const cloth = new Cloth(num, num);

const material = new MeshLambertMaterial({
  wireframe: false,
  color: 0xFF0000
});
const mesh = new Mesh(cloth, material);
mesh.material.side = DoubleSide;
scene.add(mesh);

function loop(timestamp) {
  if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
    requestAnimationFrame(loop);
    return;
  }

  delta += timestamp - lastFrameTimeMs;
  lastFrameTimeMs = timestamp;

  let numUpdateSteps = 0;
  while (delta >= timestep) {
    update(1 / 60);
    delta -= timestep;
    if (++numUpdateSteps >= 100) {
      delta = 0;
      break;
    }
  }

  render();
  requestAnimationFrame(loop);
}

function update(dt) {
  cloth.computeForces()
  cloth.update(1.0 / 60)
  cloth.computeFaceNormals()
  cloth.computeVertexNormals()
  cloth.normalsNeedUpdate = true
}

function render() {
  renderer.render(scene, camera);
}

requestAnimationFrame(loop);

document.body.appendChild(renderer.domElement);

// function animate() {
//   requestAnimationFrame(animate)
//   cloth.computeForces()
//   cloth.update(1.0 / 60)
//   cloth.computeFaceNormals()
//   cloth.computeVertexNormals()
//   cloth.normalsNeedUpdate = true
//   renderer.render(scene, camera)
// }
// animate();