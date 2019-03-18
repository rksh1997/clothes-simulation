import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh
} from 'three';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const scene = new Scene()
const camera = new PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 100);
const renderer = new WebGLRenderer()

renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);

const geometry = new BoxGeometry( 1, 1, 1 );
const material = new MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new Mesh( geometry, material );

scene.add( cube );
camera.position.z = 5;

function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}
animate();