import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(20, 20, 30);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Malla de referencia (Grid)
    const grid = new THREE.GridHelper(100, 20);
    scene.add(grid);


    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    new OrbitControls(camera, renderer.domElement);

    // --- CONEXIÓN CON EL OTRO ARCHIVO ---
    window.THREE = THREE;
    window.scene = scene;
    window.limpiarEscena = function() {
        const aEliminar = [];
        scene.traverse(obj => { if(obj.isMesh) aEliminar.push(obj); });
        aEliminar.forEach(obj => scene.remove(obj));
    };

    render();
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

init();