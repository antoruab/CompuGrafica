import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('charCanvas');
const wrapper = canvas.parentElement;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
renderer.setClearColor(0x000000, 0); // fondo transparente

// Escena y cámara
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, wrapper.clientWidth / wrapper.clientHeight, 0.1, 100);
camera.position.set(0, 1, 5);

// Luces
scene.add(new THREE.AmbientLight(0xffffff, 1));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(3, 5, 5);
scene.add(dirLight);

// Orbit controls (solo rotación, sin zoom ni pan)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 2;
controls.target.set(0, 0.5, 0);
controls.update();

// Cargar modelo Snoopy
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('../src/models/glb/');
loader.setDRACOLoader(draco);

loader.load(
    '../src/models/glb/Snoopy.glb', // ← ajusta el nombre de tu archivo
    (gltf) => {
        const model = gltf.scene;

        // Centrar el modelo automáticamente
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(center);
        model.position.y += size.y / 2;

        // Escalar para que quepa bien
        const maxDim = Math.max(size.x, size.y, size.z);
        model.scale.setScalar(2.5 / maxDim);

        scene.add(model);
    },
    undefined,
    (err) => console.error('Error cargando Snoopy.glb:', err)
);

// Loop de animación
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Responsive
window.addEventListener('resize', () => {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
});