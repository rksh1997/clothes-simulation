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


const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const scene = new Scene();
scene.background = new Color( 0xcce0ff );
scene.fog = new Fog( 0xcce0ff, 500, 10000 );

const camera = new PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 100);
camera.position.z = 5;

const renderer = new WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);

const geometry = new BoxGeometry( 1, 1, 1 );
const material = new MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new Mesh( geometry, material );


let lastFrameTimeMs = 0;
let maxFPS = 60;
let delta = 0;
let timestep = 1000 / maxFPS;

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
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01; 
}

function render(dt) {
  renderer.render( scene, camera );
}

scene.add( cube );
document.body.appendChild(renderer.domElement);
requestAnimationFrame(loop);