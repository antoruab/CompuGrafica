import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Primera figura geométrica
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xba71a2, wireframe: true });
const cube = new THREE.Mesh(geometry, material);
cube.position.x = -1.5;
scene.add(cube);

//Segunda figura geométrica
const geometryTorus = new THREE.TorusGeometry(0.5, 0.2, 8, 15);
const materialTorus = new THREE.MeshBasicMaterial({ color: 0x7e2a53, wireframe: true });
const torus = new THREE.Mesh(geometryTorus, materialTorus);
scene.add(torus);

//Tercera figura geométrica
const geometryCone = new THREE.ConeGeometry(0.5, 1.4, 15);
const materialCone = new THREE.MeshBasicMaterial({ color: 0x502a50, wireframe: true });
const cone = new THREE.Mesh(geometryCone, materialCone);
cone.position.x = 1.5;
scene.add(cone);

//Control orbita
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 5;
controls.update();

//Rotación del cubo
function animate(time) {
    cube.rotation.x = time / 2000;
    cube.rotation.y = time / 1000;

    torus.rotation.x = time / 2000;
    torus.rotation.y = time / 1000;

    cone.rotation.x = time / 2000;
    cone.rotation.y = time / 1000;

    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

//////////////////////////////
const size = 10;
const divisions = 10;
const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
///////////////////////////////

//Ajustar tamaño ventana
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}
