import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  Color,
  Fog,
  DoubleSide,
  PointLight,
  MeshPhongMaterial,
  Vector3
} from "three";
import OrbitControls from "three-orbitcontrols";

import Cloth from "./Cloth";

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const scene = new Scene();
scene.background = new Color(0xcce0ff);
scene.fog = new Fog(0xcce0ff, 500, 10000);

const camera = new PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 100);
camera.position.set(10, 0, 4.5);
camera.lookAt(0, 0, 0);

const pointLight = new PointLight(0xdddddd);
const secondLight = new PointLight(0xdddddd);
pointLight.position.copy(camera.position);
secondLight.position.copy(new Vector3(-10, 0, -7));
scene.add(pointLight);
scene.add(secondLight);

const renderer = new WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

const num = 30;
const cloth = new Cloth(num, num);

const material = new MeshPhongMaterial({
  // wireframe: true,
  color: 0xff9999
});
const mesh = new Mesh(cloth, material);
mesh.material.side = DoubleSide;
scene.add(mesh);

let lastFrameTimeMs = 0;
const maxFPS = 60;
let delta = 0;
const timestep = 1000 / maxFPS;
const physicsStep = 1 / 150;

function loop(timestamp) {
  if (timestamp < lastFrameTimeMs + timestep) {
    requestAnimationFrame(loop);
    return;
  }

  delta += timestamp - lastFrameTimeMs;
  lastFrameTimeMs = timestamp;

  let numUpdateSteps = 0;
  while (delta >= timestep) {
    update(physicsStep);
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
  cloth.computeForces();
  cloth.update(dt);
}

function render() {
  cloth.computeFaceNormals();
  cloth.computeVertexNormals();
  cloth.normalsNeedUpdate = true;
  renderer.render(scene, camera);
}

requestAnimationFrame(loop);

document.body.appendChild(renderer.domElement);

// function animate() {
//   requestAnimationFrame(animate)
//   cloth.computeForces()
//   cloth.update(1.0 / 120)
//   cloth.computeFaceNormals()
//   cloth.computeVertexNormals()
//   cloth.normalsNeedUpdate = true
//   renderer.render(scene, camera)
// }
// animate();
