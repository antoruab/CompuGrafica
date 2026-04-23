import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'lil-gui';

//Controls
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';


//Audio
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


// Scene, camara y renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(savedBgColor);
scene.fog = new THREE.Fog(0x111111, 1, 5);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

camera.position.z = 8;
camera.position.y = -1;


// Objeto principal que vamos a modificar en las transformaciones
const boxMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xff0055 })
);
boxMesh.position.set(0, -2.2, 5);
scene.add(boxMesh);



// Stats
const timer = new THREE.Timer();
timer.connect(document);

const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);



// Descriptions
const description = {
    Orbit: 'Permite rotar alrededor de un punto objetivo, hacer zoom y desplazarse. Es ideal para visualizar modelos 3D.',
    Fly: 'Permite volar a través de la escena con movimientos suaves. Es ideal para simulaciones de vuelo o exploración en primera persona.',
    FirstPerson: 'Simula el movimiento de un personaje en primera persona, permitiendo caminar y mirar alrededor. Es perfecto para juegos o experiencias inmersivas.',
    PointerLock: 'Similar a FirstPersonControls pero requiere que el usuario haga clic para bloquear el cursor, proporcionando una experiencia de control total. Es ideal para juegos en primera persona.',
    Trackball: 'Similar a OrbitControls pero con una sensación de control más fluida, como si estuvieras manipulando una bola de control. Es excelente para exploración libre.',
    Transform: 'Permite manipular objetos en la escena (mover, rotar, escalar) de manera interactiva. Es útil para editores de escenas o herramientas de diseño.'
}

// configuraciones iniciales para los controles
const controlMap = {
    Orbit: new OrbitControls(camera, renderer.domElement),
    Fly: new FlyControls(camera, renderer.domElement),
    FirstPerson: new FirstPersonControls(camera, renderer.domElement),
    PointerLock: new PointerLockControls(camera, document.body),
    Trackball: new TrackballControls(camera, renderer.domElement),
    Transform: new TransformControls(camera, renderer.domElement)
};

// Configuración específica de los controles
controlMap.Fly.movementSpeed = 5;
controlMap.Fly.rollSpeed = Math.PI / 24;
controlMap.FirstPerson.movementSpeed = 5;
controlMap.FirstPerson.lookSpeed = 0.1;
controlMap.Transform.attach(boxMesh); //Asociamos el TransformControls al objeto boxMesh


// Gestion de interfaz y cambio de controls
let activeControl = 'Orbit'; // Control activo por defecto
const titleElement = document.getElementById('control-title');
const descElement = document.getElementById('control-desc');


function setControls(key) {

    // Apagar todos los controles
    Object.keys(controlMap).forEach(controlKey => {
        const control = controlMap[controlKey];
        if (control.enabled !== undefined) control.enabled = false; // Para controles que tienen enabled

        if (controlKey === 'Transform') scene.remove(control.getHelper()); // Para TransformControls, lo removemos de la escena (removemos el helper que es lo que se ve)
    });

    activeControl = key;
    const active = controlMap[key];

    // PANTALLA DE INSTRUCCIONES (instruccionDIV) ** Pendiente

    // Cambiamos el texto del título y la descripción (Inferior izquierda)
    titleElement.textContent = `${key} Controls`;
    descElement.textContent = description[key] || 'Descripción no disponible.';

    // Logica para activar el control seleccionado
    if (key === 'Transform') {
        scene.add(active.getHelper());
        active.enabled = true;
        controlMap.Orbit.enabled = false;
    } else if (key === 'PointerLock') {
        // No se activa automáticamente, el usuario debe hacer clic para bloquear el cursor
    } else {
        if (active.enabled !== undefined) active.enabled = true; // Activamos el control seleccionado    
    }

    // Para la opcion de firstperson debemos capturar el pointer lock


    // Lógica para establecer los controles
    // alert(`Cambiando a ${key} Controls`);

    // Lógica del movimiento Pointer Lock (PointerLockControls)
    const keys = { w: false, a: false, s: false, d: false };
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();

    window.addEventListener('keydown', (event) => {
        if (keys.hasOwnProperty(event.key.toLowerCase())) keys[event.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (event) => {
        if (keys.hasOwnProperty(event.key.toLowerCase())) keys[event.key.toLowerCase()] = false;
    });

}


// Load 3D model
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('../src/models/glb');
loader.setDRACOLoader(dracoLoader);
const gltf = await loader.loadAsync('../src/models/glb/Casita.glb');
gltf.scene.position.set(0, -2.5, 3.5);
gltf.scene.rotation.y = Math.PI * 1.5;
scene.add(gltf.scene);


// GUI
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
cameraFolder3.add({ Script: 'Orbit' }, 'Script', ['Orbit', 'Trackball', 'Fly', 'FirstPerson', 'PointerLock', 'Transform']).onChange(setControls);
cameraFolder3.open();

//Animate
function animate() {

    timer.update();
    stats.update();

    const delta = timer.getDelta();

    // Actualizamos los controles activos
    if (activeControl === 'Orbit') controlMap.Orbit.update();
    if (activeControl === 'Trackball') controlMap.Trackball.update();
    if (activeControl === 'Fly') controlMap.Fly.update(delta); // El valor es el delta time, ajusta según sea necesario
    if (activeControl === 'FirstPerson') controlMap.FirstPerson.update(delta);

    // PointerLockControls no necesita actualización en el loop, se maneja con eventos de mouse
    //Movimiento manual para PointerLockControls

    if (activeControl === 'PointerLock' && controlMap.PointerLock.isLocked) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(keys.w) - Number(keys.s);
        direction.x = Number(keys.d) - Number(keys.a);
        direction.normalize(); // Esto asegura que la dirección tenga una longitud de 1

        if (keys.w || keys.s) velocity.z -= direction.z * 400.0 * delta;
        if (keys.a || keys.d) velocity.x -= direction.x * 400.0 * delta;

        controlMap.PointerLock.moveRight(-velocity.x * delta);
        controlMap.PointerLock.moveForward(-velocity.z * delta);
    }

    renderer.render(scene, camera);
}


window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}