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
  Vector3
} from 'three';
import Particle from './Particle';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const scene = new Scene();
scene.background = new Color( 0xcce0ff );
scene.fog = new Fog( 0xcce0ff, 500, 10000 );

const camera = new PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 100);
camera.position.z = 5;

const renderer = new WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);

const geometry = new SphereGeometry( .1, 10, 10 );
const material = new MeshBasicMaterial( { color: 0xbbaacc } );


let lastFrameTimeMs = 0;
let maxFPS = 60;
let delta = 0;
let timestep = 1000 / maxFPS;

const particles = [];
const width = 10;
const height = 10;
function init() {
  for(let i = 0; i < width; i += 1) {
    for (let j = 0; j < height; j += 1) {
        const t = new Particle(
            geometry,
            material,
            new Vector3((i * 5) / width - 2.5, (j * 5) / height - 2.5, 0),
            10
        );
        particles.push(t);
        scene.add(t);
    }
  }
}

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
  renderer.render( scene, camera );
}


document.body.appendChild(renderer.domElement);
init();
// console.log(particles)

requestAnimationFrame(loop);
