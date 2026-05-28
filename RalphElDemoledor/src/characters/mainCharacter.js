import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── RUTAS DE LOS MODELOS GLB ──────────────────────────────────────────────
// Cambia estas rutas por las de tus archivos reales
const GLB_RALPH = '../glb/Ralph.glb';
const GLB_FELIX = '../glb/Felix.glb';
// ─────────────────────────────────────────────────────────────────────────

const canvas  = document.getElementById('charCanvas');
const wrapper = canvas.parentElement;

// ── RENDERER ──────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
renderer.setClearColor(0x000000, 0);



// ── ESCENA Y CÁMARA ───────────────────────────────────────────────────────
const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, wrapper.clientWidth / wrapper.clientHeight, 0.1, 100);
camera.position.set(0, 1, 5);

// ── LUCES ─────────────────────────────────────────────────────────────────
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

// ── CONTROLES ─────────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom      = false;
controls.enablePan       = false;
controls.autoRotate      = true;
controls.autoRotateSpeed = 2;
controls.target.set(0, 0.5, 0);
controls.update();

// ── LOADER ────────────────────────────────────────────────────────────────
const loader = new GLTFLoader();
const draco  = new DRACOLoader();
draco.setDecoderPath('../src/models/glb/');
loader.setDRACOLoader(draco);

// ── MODELO ACTIVO ─────────────────────────────────────────────────────────
let currentModel = null;

function loadModel(path) {
    // Eliminar modelo anterior si existe
    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
    }

    loader.load(
        path,
        (gltf) => {
            const model = gltf.scene;

            // Centrar y escalar automáticamente
            const box    = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size   = box.getSize(new THREE.Vector3());

            model.position.sub(center);
            model.position.y += size.y / -3;

            const maxDim = Math.max(size.x, size.y, size.z);
            model.scale.setScalar(4.5 / maxDim);

            scene.add(model);
            currentModel = model;
        },
        undefined,
        (err) => console.error('Error cargando modelo:', path, err)
    );
}

// Cargar Ralph por defecto (ya seleccionado)
loadModel(GLB_RALPH);

document.querySelectorAll('.char-slot:not(.locked)').forEach(slot => {
    slot.addEventListener('click', () => {
        const name = slot.dataset.name;
        if (name === 'Ralph') loadModel(GLB_RALPH);
        if (name === 'Felix') loadModel(GLB_FELIX);
    });
});

// ── LOOP ──────────────────────────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// ── RESIZE ────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
});