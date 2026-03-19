import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8f9fa);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// First Geometry Shape
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x000080, transparent: true, opacity: 0.5, wireframe: true, wireframeLineMaterial: 6 });

const materialStand = new THREE.MeshStandardMaterial({ color: 0xff00ff, roughness: 0.5, metalness: 1.0, transparent: false });

const materialPhong = new THREE.MeshPhongMaterial({
    color: 0xffffff, specular: 0xffffff, shininess: 30, side: THREE.DoubleSide,
    map: new THREE.TextureLoader().load('../../portafolio/Class 6/img/uv_test_bw_1024.png')
}); //Ejemplo https://threejs.org/examples/textures/uv_grid_opengl.jpg

const materialNormal = new THREE.MeshNormalMaterial({ color: 0xff0080, transparent: true, opacity: 1, wireframe: true, wireframeLinewidth: 5, wireframeLinejoin: 'round', wireframeLinecap: 'round' });

const materialCube = [new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('../../portafolio/Class 6/img/face1.jpg'), side: THREE.DoubleSide }),
new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('../../portafolio/Class 6/img/face2.png'), side: THREE.DoubleSide }),
new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('../../portafolio/Class 6/img/face3.jpg'), side: THREE.DoubleSide }),
new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('../../portafolio/Class 6/img/face4.jpg'), side: THREE.DoubleSide }),
new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('../../portafolio/Class 6/img/face5.png'), side: THREE.DoubleSide }),
new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('../../portafolio/Class 6/img/face6.jpg'), side: THREE.DoubleSide })];

const materialLambert = new THREE.MeshLambertMaterial({
    color: 0xf3ffe2, emissive: 0xff00000, emissiveIntensity: 0.1, side: THREE.DoubleSide,
    map: new THREE.TextureLoader().load('../../portafolio/Class 6/img/wool.jpg')
});

const materialDepth = new THREE.MeshDepthMaterial();

const materialPoints = new THREE.PointsMaterial({ color: 0x7e2a53, size: 0.05 });

const materialLineDashed = new THREE.LineDashedMaterial({ dashSize: 2, gapSize: 2 });

/* const materialSprite = new THREE.SpriteMaterial({ map: new THREE.TextureLoader().load('../../portafolio/Class 6/img/wool.jpg')}); */


const cube4 = new THREE.Mesh(geometry, materialLambert);
cube4.position.x = -1.5;
cube4.position.y = 1.5;

const cube5 = new THREE.Mesh(geometry, materialCube);
cube5.position.x = 0;
cube5.position.y = 1.5;

const cube6 = new THREE.Mesh(geometry, materialNormal);
cube6.position.x = 1.5;
cube6.position.y = 1.5;

const cube7 = new THREE.Mesh(geometry, materialDepth);
cube7.position.x = -1.5;
cube7.position.y = -1.5;

const cube8 = new THREE.Mesh(geometry, materialPoints);
cube8.position.x = 0;
cube8.position.y = -1.5;

const cube9 = new THREE.Mesh(geometry, materialLineDashed);
cube9.position.x = 1.5;
cube9.position.y = -1.5;

/* const cube10 = new THREE.Mesh(geometry, materialSprite);
cube10.position.x = 0;
cube10.position.y = -3.0; */

/* // LineDashedMaterial - requiere computeLineDistances()
const edges = new THREE.EdgesGeometry(geometry);
const lineLoop = new THREE.LineSegments(edges, materialLineDashed);
lineLoop.computeLineDistances(); // ← obligatorio para que funcione el dashed
lineLoop.position.x = 6.0;
scene.add(lineLoop); */

scene.add(cube1);
scene.add(cube2);
scene.add(cube3);
scene.add(cube4);
scene.add(cube5);
scene.add(cube6);
scene.add(cube7);
scene.add(cube8);
scene.add(cube9);
// scene.add(cube10);


const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 5;
controls.update();

function animate(time) {
    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

///////////////////////////////////////////////
const size = 20;
const divisions = 20;
const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
///////////////////////////////////////////////


window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}