import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { GUI } from 'lil-gui';

const savedVolume  = localStorage.getItem('cg_volume')  ?? '80';
const savedSong    = localStorage.getItem('cg_song')    ?? '../src/sounds/intro.mp3';
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

const timer = new THREE.Timer();
timer.connect(document);

const scene = new THREE.Scene();
scene.background = new THREE.Color(savedBgColor); // usa la variable de arriba

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

camera.position.z = 8;
camera.position.y = -1;

const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

function animate() {
    timer.update();
    stats.update();
    renderer.render(scene, camera);
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
  intensity: 2,
  color: '#f0f420',
  positionX: 0,
};

// Crear la carpeta de luz
const lightFolder = gui.addFolder('Light');
lightFolder.open();

// Añadir controles a la carpeta de luz
lightFolder.add(params, 'lightType', ['Hemisphere', 'Directional', 'Ambient']).name('Light Type').onChange(changeTypeLight);
lightFolder.add(params, 'enabled').name('Light Enabled').onChange(value => currentLight.visible = value);
lightFolder.add(params, 'intensity', 0, 2).name('Light Intensity').onChange(value => currentLight.intensity = value);
lightFolder.addColor(params, 'color').name('Light Color').onChange(value => currentLight.color.set(value));
lightFolder.add(params, 'positionX', -10, 10).name('Position X');
lightFolder.add(params, 'toggleLight').name('Toggle Light');

// Light
let currentLight = new THREE.HemisphereLight( 0x8dc1de, 0x00668d, 1.5 );
scene.add( currentLight );

function changeTypeLight(typeLight) {
    scene.remove(currentLight);
    switch (typeLight) {
        case 'Hemisphere':
            currentLight = new THREE.HemisphereLight( 0x8dc1de, 0x00668d, 1.5 );
        break;
        case 'Directional':
            currentLight = new THREE.DirectionalLight( 0xffffff, 1 );
            currentLight.position.set( 5, 10, 7.5 );
        break;
        case 'Ambient':
            currentLight = new THREE.AmbientLight( 0xffffff, 0.5 );
        break;

        default:
            currentLight = new THREE.HemisphereLight( 0x8dc1de, 0x00668d, 1.5 );
        break
    }

    currentLight.position.set( 2, 1, 1 );
    scene.add( currentLight );
}

const cameraFolder = gui.addFolder('Camera Translation');
      cameraFolder.add(camera.position, 'x', 0, 10).name('Position X');
      cameraFolder.add(camera.position, 'y', 0, 10).name('Position Y');
      cameraFolder.add(camera.position, 'z', 0, 10).name('Position Z');

      cameraFolder.open();

const cameraFolder2 = gui.addFolder('Camera Rotation');
      cameraFolder2.add(camera.rotation, 'x', 0, Math.PI * 2).name('Rotation X');
      cameraFolder2.add(camera.rotation, 'y', 0, Math.PI * 2).name('Rotation Y');
      cameraFolder2.add(camera.rotation, 'z', 0, Math.PI * 2).name('Rotation Z');
      cameraFolder2.open();     

const cameraFolder3 = gui.addFolder('Camera Controls');  
        cameraFolder3.add({ Script: 'Orbit' }, 'Script', ['Orbit', 'Trackball', 'Fly', 'FirstPerson', 'PointerLock']).onChange();  