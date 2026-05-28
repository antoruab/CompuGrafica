import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const GLB_RALPH = '../glb/Ralph.glb';
const GLB_FELIX = '../glb/Felix.glb';

const canvas  = document.getElementById('charCanvas');
const wrapper = canvas.parentElement;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
renderer.setClearColor(0x000000, 0);

const scene  = new THREE.Scene();
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
controls.enableZoom      = false;
controls.enablePan       = false;
controls.autoRotate      = true;
controls.autoRotateSpeed = 2;
controls.target.set(0, 0.5, 0);
controls.update();

const loader = new GLTFLoader();
const draco  = new DRACOLoader();
draco.setDecoderPath('../glb/');
loader.setDRACOLoader(draco);

let currentModel = null;

function loadModel(path) {
    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
    }
    loader.load(path, (gltf) => {
        const model  = gltf.scene;
        const box    = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());

        model.position.sub(center);

        const isFelix = path.includes('Felix');

        if (isFelix) {
            model.rotation.y = 0;               // de frente
            model.position.y += size.y / -4;
            const maxDim = Math.max(size.x, size.y, size.z);
            model.scale.setScalar(6.5 / maxDim); // más grande
        } else {
            model.position.y += size.y / -3;
            const maxDim = Math.max(size.x, size.y, size.z);
            model.scale.setScalar(4.5 / maxDim);
        }

        scene.add(model);
        currentModel = model;
    }, undefined, (err) => console.error('Error cargando modelo:', path, err));
}

function updateStats(slot) {
    document.querySelectorAll('.char-slot').forEach(s => s.classList.remove('active'));
    slot.classList.add('active');

    document.getElementById('char-name').textContent = slot.dataset.name;

    const set = (barId, valId, val) => {
        const bar = document.getElementById(barId);
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = val + '%'; }, 30);
        document.getElementById(valId).textContent = val;
    };
    set('stat-int', 'val-int', slot.dataset.int);
    set('stat-str', 'val-str', slot.dataset.str);
    set('stat-ter', 'val-ter', slot.dataset.ternura);
    set('stat-cre', 'val-cre', slot.dataset.crea);
}

document.querySelectorAll('.char-slot:not(.locked)').forEach(slot => {
    slot.addEventListener('click', () => {
        updateStats(slot);
        loadModel(GLB_RALPH);
    });
});

loadModel(GLB_RALPH);

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