import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Base de la casa
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshBasicMaterial({ color: 0xFFF495});
const cube = new THREE.Mesh(geometry, material);
cube.position.y = 1;
scene.add(cube);

//Techo de la casa
const geometryRoof = new THREE.ConeGeometry(2, 1, 4);
const materialRoof = new THREE.MeshBasicMaterial({ color: 0xc93c20 });
const roof = new THREE.Mesh(geometryRoof, materialRoof);
roof.position.y = 2.5;
roof.rotation.y = 45 * Math.PI / 180;
scene.add(roof);

//Puerta de la casa
const geometryDoor = new THREE.BoxGeometry(0.5, 1, 0.1);
const materialDoor = new THREE.MeshBasicMaterial({ color: 0x1F0E04 });
const door = new THREE.Mesh(geometryDoor, materialDoor);
door.position.y = 0.5;
door.position.z = 1.05;
scene.add(door);

//Ventanas de la casa
const geometryWindow = new THREE.BoxGeometry(0.5, 0.5, 0.1);
const materialWindow = new THREE.MeshBasicMaterial({ color: 0xA8C8E3 });
const window1 = new THREE.Mesh(geometryWindow, materialWindow);
const window2 = new THREE.Mesh(geometryWindow, materialWindow);
window1.position.y = 1.5;
window1.position.x = -0.75;
window1.position.z = 1.05;
scene.add(window1);

window2.position.y = 1.5;
window2.position.x = 0.75;
window2.position.z = 1.05;
scene.add(window2);


const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 5;
controls.update();


function animate(time) {
    
    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);


const size = 10;
const divisions = 10;
const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);


window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}
