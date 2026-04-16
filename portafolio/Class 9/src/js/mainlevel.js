import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

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