import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  Color,
  Fog,
  DoubleSide,
  PointLight,
  Projector,
  MeshStandardMaterial,
  Vector3,
  Raycaster
} from 'three';

import Cloth from './Cloth';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const scene = new Scene();
scene.background = new Color(0xcce0ff);
scene.fog = new Fog(0xcce0ff, 500, 10000);

const camera = new PerspectiveCamera(40, WIDTH / HEIGHT, 0.1, 100);
camera.position.set(0, 10, 7)
camera.lookAt(0, 0, 0);

const pointLight = new PointLight(0xdddddd);
pointLight.position.copy(camera.position)
scene.add(pointLight);

const projector = new Projector();
const renderer = new WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);

let lastFrameTimeMs = 0;
let maxFPS = 60;
let delta = 0;
let timestep = 1000 / maxFPS;

const cloth = new Cloth(15, 15);

const material = new MeshStandardMaterial({ wireframe: false, color: 0xff0000 });
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
    update(timestep);
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
  cloth.update()
  cloth.computeFaceNormals()
  cloth.computeVertexNormals()
  cloth.normalsNeedUpdate = true
}

function render() {
  renderer.render(scene, camera);
}


document.body.appendChild(renderer.domElement);
requestAnimationFrame(loop);
