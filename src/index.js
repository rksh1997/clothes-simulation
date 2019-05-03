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
  Vector3,
  SphereGeometry
} from 'three';
import OrbitControls from 'three-orbitcontrols';

import Cloth from './Cloth';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const scene = new Scene();
scene.background = new Color(0xcce0ff);
scene.fog = new Fog(0xcce0ff, 500, 10000);

const camera = new PerspectiveCamera(45, WIDTH / HEIGHT, 0.01, 100);
camera.position.set(10, 0, 0)
camera.lookAt(0, 0, 0);

const pointLight = new PointLight(0xdddddd);
const secondLight = new PointLight(0xdddddd);
pointLight.position.copy(camera.position)
secondLight.position.copy(new Vector3(-10, 0, -7));
scene.add(pointLight);
scene.add(secondLight);

const renderer = new WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);

const controls = new OrbitControls(camera, renderer.domElement)
controls.update()
// controls.autoRotate = true
controls.enableDamping = true
controls.dampingFactor = 0.25
controls.enableZoom = true

const num = 30
const cloth = new Cloth(num, num);

const material = new MeshPhongMaterial({
  // wireframe: true,
  color: 0x00CED1
});
const mesh = new Mesh(cloth, material);
mesh.material.side = DoubleSide;
scene.add(mesh);

if (cloth.createBall) {
  let sgeo = new SphereGeometry(cloth.ballRadius, 16, 16)
  let smat = new MeshPhongMaterial({
    // wireframe: true,
    color: 0xffffff
  })
  let sphere = new Mesh(sgeo, smat)
  sphere.position.copy(cloth.ballPos)
  scene.add(sphere)
}

document.body.appendChild(renderer.domElement);

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  cloth.computeForces()
  cloth.update(1.0 / 120)
  cloth.computeFaceNormals()
  cloth.computeVertexNormals()
  cloth.normalsNeedUpdate = true
  renderer.render(scene, camera)
}
animate();