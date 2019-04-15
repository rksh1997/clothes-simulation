import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  // OrbitControls,
  Mesh,
  Color,
  Fog,
  DoubleSide,
  PointLight,
  MeshNormalMaterial,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial
} from 'three';

import Cloth from './Cloth';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const scene = new Scene();
scene.background = new Color(0xcce0ff);
scene.fog = new Fog(0xcce0ff, 500, 10000);

const camera = new PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 100);
camera.position.set(11, 0, 2.5)
camera.lookAt(0, 0, 0);

const pointLight = new PointLight(0xdddddd);
pointLight.position.copy(camera.position)
scene.add(pointLight);

const renderer = new WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);

const num = 60
const cloth = new Cloth(num, num);

const material = new MeshPhongMaterial({
  wireframe: true,
  color: 0xFF9999
});
const mesh = new Mesh(cloth, material);
mesh.material.side = DoubleSide;
scene.add(mesh);

// let lastFrameTimeMs = 0;
// let maxFPS = 60;
// let delta = 0;
// let timestep = 1000 / maxFPS;

/*
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
  cloth.update(dt)
}

function render(dt) {
  cloth.computeFaceNormals()
  cloth.computeVertexNormals()
  cloth.normalsNeedUpdate = true
  renderer.render(scene, camera);
}

requestAnimationFrame(loop);
*/

document.body.appendChild(renderer.domElement);

function animate() {
  requestAnimationFrame(animate)
  cloth.computeForces()
  cloth.update(1.0 / 120)
  cloth.computeFaceNormals()
  cloth.computeVertexNormals()
  cloth.normalsNeedUpdate = true
  renderer.render(scene, camera)
}
animate();