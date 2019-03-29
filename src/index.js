import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Color,
  Fog,
  SphereGeometry,
  Vector3,
  Geometry
} from 'three';

import Particle from './Particle';
import Cloth from './Cloth';

// console.log(new Geometry());

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const scene = new Scene();
scene.background = new Color( 0xcce0ff );
scene.fog = new Fog( 0xcce0ff, 500, 10000 );

const camera = new PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 100);
camera.position.z = 2;

const renderer = new WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);

// const geometry = new SphereGeometry( .1, 10, 10 );
// const material = new MeshBasicMaterial( { color: 0xbbaacc } );

let lastFrameTimeMs = 0;
let maxFPS = 60;
let delta = 0;
let timestep = 1000 / maxFPS;

const cloth = new Cloth(10, 10);
const material = new MeshBasicMaterial({ wireframe:true, color: 0xff0000 });
const mesh = new Mesh(cloth, material);
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
  
}

function render(dt) {
  renderer.render(scene, camera);
}


document.body.appendChild(renderer.domElement);
// console.log(particles)

requestAnimationFrame(loop);
