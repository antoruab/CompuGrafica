import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('charCanvas');
const wrapper = canvas.parentElement;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, wrapper.clientWidth / wrapper.clientHeight, 0.1, 100);
camera.position.set(0, 1, 5);


scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(3, 5, 5);
scene.add(dirLight);


const fillLight = new THREE.DirectionalLight(0xd0c0ff, 1.2);
fillLight.position.set(-4, 2, 2);
scene.add(fillLight);

const bottomLight = new THREE.DirectionalLight(0xffffff, 0.6);
bottomLight.position.set(0, -3, 2);
scene.add(bottomLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 2;
controls.target.set(0, 0.5, 0);
controls.update();

const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('../src/models/glb/');
loader.setDRACOLoader(draco);

loader.load(
    '../src/models/glb/Snoopy.glb',
    (gltf) => {
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(center);
        model.position.y += size.y / -3; 
       
        const maxDim = Math.max(size.x, size.y, size.z);
        model.scale.setScalar(4.5 / maxDim);

        scene.add(model);
    },
    undefined,
    (err) => console.error('Error cargando Snoopy.glb:', err)
);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
});


// Audio
const savedVol = localStorage.getItem('cg_volume');
if (savedVol) audio.volume = savedVol / 100;

window.addEventListener('load', function () {
    var audio = document.getElementById('myAudio');
    var reproducir = function () {
        audio.play().then(function () {
            document.removeEventListener('click', reproducir);
            document.removeEventListener('keydown', reproducir);
        }).catch(function () {
            console.log("Esperando interacción real...");
        });
    };
    document.addEventListener('click', reproducir);
    document.addEventListener('keydown', reproducir);
});