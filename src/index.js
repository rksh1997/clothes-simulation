import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  // BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Color,
  Fog,
  // SphereGeometry,
  // Vector3,
  // Geometry,
  DoubleSide,
  PointLight,
  MeshPhongMaterial,
  MeshLambertMaterial,
  MeshNormalMaterial,
  MeshStandardMaterial
} from 'three';

// import Particle from './Particle';
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

const cloth = new Cloth(10, 10);

const material = new MeshStandardMaterial({ wireframe: false, color: 0xff0000 });
const mesh = new Mesh(cloth, material);
mesh.material.side = DoubleSide;
scene.add(mesh);
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
    update(timestep);
    delta -= timestep;
    if (++numUpdateSteps >= 100) {
      delta = 0;
      break;
    }
  }

  render();
  requestAnimationFrame(loop);

  // cloth.update()
}

function update(dt) {
  
}

function render(dt) {
  renderer.render(scene, camera);
}
*/

document.body.appendChild(renderer.domElement);

// requestAnimationFrame(loop);


function animate() {
  requestAnimationFrame(animate) 
  cloth.computeForces()
  cloth.update()
  cloth.computeFaceNormals()
  cloth.computeVertexNormals()
  cloth.normalsNeedUpdate = true
  renderer.render(scene, camera)
}
animate();

// function test_stuff() {
//   // camera.position.applyAxisAngle(new Vector3(0, 1, 0), -0.02);
//   // camera.lookAt(0,0,0);

//   for (var i in cloth.vertices) {
//     cloth.vertices[i].y -= 0.01;
//     // cloth.vertices[i].applyAxisAngle(new Vector3(0, 1, 0), -0.02);
//   }
//   cloth.verticesNeedUpdate = true;
// }