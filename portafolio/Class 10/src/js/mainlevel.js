import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'lil-gui';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';


const savedVolume = localStorage.getItem('cg_volume') ?? '80';
const savedSong = localStorage.getItem('cg_song') ?? '../src/sounds/intro.mp3';
const savedBgColor = localStorage.getItem('cg_bgcolor') ?? '#7BD0F7';

const audio = document.getElementById('myAudio2');

audio.pause();
audio.src = savedSong;
audio.volume = Number(savedVolume) / 100;
audio.load();
audio.play().catch(() => {
    const resume = () => { audio.play(); document.removeEventListener('click', resume); };
    document.addEventListener('click', resume);
});

// Stats
const timer = new THREE.Timer();
timer.connect(document);

// Scene, camara y renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(savedBgColor);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

camera.position.z = 8;
camera.position.y = -1;

// OBjeto principal que vamos a modificar en las transformaciones
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0055 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);


const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

const description = {
    Orbit: 'OrbitControls: Permite rotar alrededor de un punto objetivo, hacer zoom y desplazarse. Es ideal para escenas donde el usuario quiere explorar un objeto o entorno desde diferentes ángulos.',
    Trackball: 'TrackballControls: Similar a OrbitControls pero con un comportamiento más fluido y natural, como si estuvieras manipulando una bola de cristal. Es excelente para escenas artísticas o donde se desea una interacción más orgánica.',
    Fly: 'FlyControls: Permite volar a través de la escena como si estuvieras en un avión. Es ideal para simulaciones de vuelo o exploración de grandes entornos 3D.',
    FirstPerson: 'FirstPersonControls: Simula la perspectiva de un personaje en primera persona, permitiendo caminar y mirar alrededor. Es perfecto para juegos de aventura o simuladores de caminata.',
    PointerLock: 'PointerLockControls: Similar a FirstPersonControls pero con control total del mouse, bloqueando el cursor en la ventana. Es ideal para juegos de disparos en primera persona o experiencias inmersivas donde se requiere precisión en el control del mouse.',
    Transform: 'TransformControls: Permite manipular objetos en la escena (mover, rotar, escalar) de manera interactiva. Es útil para editores de escenas o aplicaciones donde el usuario necesita modificar objetos directamente.'
}

const controlMap = {
    Orbit: new OrbitControls(camera, renderer.domElement),
    Trackball: new TrackballControls(camera, renderer.domElement),
    Fly: new FlyControls(camera, renderer.domElement),
    FirstPerson: new FirstPersonControls(camera, renderer.domElement),
    PointerLock: new PointerLockControls(camera, document.body),
    Transform: new TransformControls(camera, renderer.domElement)
};

// Configuración inicial de controles
controlMap.Fly.movementSpeed = 5;
controlMap.Fly.rollSpeed = Math.PI / 24;
controlMap.FirstPerson.movementSpeed = 5;
controlMap.FirstPerson.lookSpeed = 0.1;

function animate() {
    timer.update();
    stats.update();
    renderer.render(scene, camera);
}

// UI
const titleElement = document.getElementById('control-title');
const descElement = document.getElementById('control-desc');

function setControls(key) {
    // Lógica para establecer los controles
    // alert(`Cambiando a ${key} Controls`);

    titleElement.textContent = `${key} Controls`;
    descElement.textContent = description[key] || 'Descripción no disponible.';
}


// Load Scene
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('../src/models/glb');
loader.setDRACOLoader(dracoLoader);
const gltf = await loader.loadAsync('../src/models/glb/Casita.glb');
gltf.scene.position.set(0, -2.5, 3.5);
gltf.scene.rotation.y = Math.PI * 1.5;
scene.add(gltf.scene);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


const gui = new GUI();

// Parámteros iniciales para controlar la luz
const params = {
    lightType: 'Hemisphere',
    enabled: true,
    intensity: 1,
    color: '#ffffff',
    positionX: 0,
    toggleLight: function () {
        this.enabled = !this.enabled;
    }
};

// Crear la carpeta de luz
const lightFolder = gui.addFolder('Light');
lightFolder.close();

// Añadir controles a la carpeta de luz
lightFolder.add(params, 'lightType', ['Hemisphere', 'Directional', 'Ambient']).name('Light Type').onChange(changeTypeLight);
lightFolder.add(params, 'enabled').name('Light Enabled').onChange(value => currentLight.visible = value);
lightFolder.add(params, 'intensity', 0, 2).name('Light Intensity').onChange(value => currentLight.intensity = value);
lightFolder.addColor(params, 'color').name('Light Color').onChange(value => currentLight.color.set(value));
lightFolder.add(params, 'positionX', -10, 10).name('Position X');
lightFolder.add(params, 'toggleLight').name('Toggle Light');

// Light
let currentLight = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
scene.add(currentLight);

function changeTypeLight(typeLight) {
    scene.remove(currentLight);
    switch (typeLight) {
        case 'Hemisphere':
            currentLight = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
            break;
        case 'Directional':
            currentLight = new THREE.DirectionalLight(0xffffff, 1);
            currentLight.position.set(5, 10, 7.5);
            break;
        case 'Ambient':
            currentLight = new THREE.AmbientLight(0xffffff, 0.5);
            break;

        default:
            currentLight = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
            break
    }

    currentLight.position.set(2, 1, 1);
    scene.add(currentLight);
}

const cameraFolder = gui.addFolder('Camera Translation');
cameraFolder.add(camera.position, 'x', 0, 10).name('Position X');
cameraFolder.add(camera.position, 'y', 0, 10).name('Position Y');
cameraFolder.add(camera.position, 'z', 0, 10).name('Position Z');
cameraFolder.close();

const cameraFolder2 = gui.addFolder('Camera Rotation');
cameraFolder2.add(camera.rotation, 'x', 0, Math.PI * 2).name('Rotation X');
cameraFolder2.add(camera.rotation, 'y', 0, Math.PI * 2).name('Rotation Y');
cameraFolder2.add(camera.rotation, 'z', 0, Math.PI * 2).name('Rotation Z');
cameraFolder2.close();

const cameraFolder3 = gui.addFolder('Camera Controls');
cameraFolder3.add({ Script: 'Orbit' }, 'Script', ['Orbit', 'Trackball', 'Fly', 'FirstPerson', 'PointerLock']).onChange(setControls);
cameraFolder3.open();