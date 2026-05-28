const GAME = {
  state: 'title',
  score: 0,
  lives: 3,
  paused: false,
  timeLeft: 60,
  timerInterval: null,
  bgColor: '#0a0a1a',
};

const PHYSICS = {
  gravity:   -30,
  jumpForce:  18,
  moveSpeed:   6,
};

// ── RUTAS DE ARCHIVOS ──────────────────────────
const PATHS = {
  building:     'src/img/Edificio.png',
  ralph:        'src/img/ralph.png',
  settingsIcon: 'src/img/settings-icon.png',
  music:        'src/audio/music.mp3',
};
// ──────────────────────────────────────────────

const canvas   = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x0a0a1a);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
camera.position.set(0, 5, 20);
camera.lookAt(0, 4, 0);

function onResize() {
  const wrapper = document.getElementById('game-wrapper');
  const w = wrapper.clientWidth;
  const h = wrapper.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);
onResize();

scene.add(new THREE.AmbientLight(0xffffff, 0.9));

const dirLight = new THREE.DirectionalLight(0xfff8e0, 1.4);
dirLight.position.set(6, 14, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.left   = -18;
dirLight.shadow.camera.right  =  18;
dirLight.shadow.camera.top    =  18;
dirLight.shadow.camera.bottom = -4;
scene.add(dirLight);

const rimLight = new THREE.PointLight(0x5ecfff, 0.8, 40);
rimLight.position.set(-8, 8, 4);
scene.add(rimLight);

const texLoader = new THREE.TextureLoader();

const buildingTex  = texLoader.load(PATHS.building);
const buildingMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 18),
  new THREE.MeshBasicMaterial({ map: buildingTex, transparent: true, alphaTest: 0.05 })
);
buildingMesh.position.set(0, 5, -1);
scene.add(buildingMesh);

// ── PLATAFORMAS ────────────────────────────────
// Modifica los valores Y para ajustar a cada piso del edificio.
// El edificio ocupa de Y=0 (suelo) a Y≈14 (techo).
const PLATFORM_DEFS = [
  { x: 0, y: 0.1,  w: 9.0 },
  { x: 0, y: 3.05, w: 8.5 },
  { x: 0, y: 6.15, w: 8.5 },
  { x: 0, y: 9.0,  w: 8.5 },
  { x: 0, y: 11.7, w: 8.5 },
  { x: 0, y: 14.2, w: 8.0 },
];

const platMat = new THREE.MeshStandardMaterial({
  color:       0x8b3a2a,
  roughness:   0.85,
  metalness:   0.05,
  transparent: true,
  opacity:     0.55,
});

const platEdgeMat = new THREE.MeshStandardMaterial({
  color:             0xc0533a,
  emissive:          0x6b1e10,
  emissiveIntensity: 0.4,
  transparent:       true,
  opacity:           0.75,
});

const platforms = [];

PLATFORM_DEFS.forEach(def => {
  const group = new THREE.Group();

  group.add(Object.assign(
    new THREE.Mesh(new THREE.BoxGeometry(def.w, 0.12, 0.7), platMat),
    { receiveShadow: true }
  ));

  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(def.w + 0.04, 0.04, 0.74),
    platEdgeMat
  );
  edge.position.y = 0.08;
  group.add(edge);

  group.position.set(def.x, def.y, 0.3);
  scene.add(group);

  platforms.push({
    group,
    box: new THREE.Box3(
      new THREE.Vector3(def.x - def.w / 2, def.y,        -0.1),
      new THREE.Vector3(def.x + def.w / 2, def.y + 0.16,  1.0)
    ),
    def,
  });
});

// ── JUGADOR ────────────────────────────────────
const player = {
  sprite:      null,
  vel:         new THREE.Vector3(),
  pos:         new THREE.Vector3(0, 0.3, 0.5),
  onGround:    false,
  facingRight: true,
  width:       0.8,
  height:      1.8,
};

const ralphSprite = new THREE.Sprite(
  new THREE.SpriteMaterial({ map: texLoader.load(PATHS.ralph), transparent: true, alphaTest: 0.05 })
);
ralphSprite.scale.set(1.6, 2.8, 1);
ralphSprite.position.copy(player.pos);
scene.add(ralphSprite);
player.sprite = ralphSprite;

// ── CONTROLES ──────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Escape' && GAME.state === 'playing') togglePause();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

// ── FÍSICA ────────────────────────────────────
const playerBox = new THREE.Box3();

function updatePlayer(dt) {
  if (GAME.state !== 'playing' || GAME.paused) return;

  const dir = (keys['KeyA'] || keys['ArrowLeft'])  ? -1 :
              (keys['KeyD'] || keys['ArrowRight']) ?  1 : 0;

  player.vel.x = dir * PHYSICS.moveSpeed;

  if (dir !== 0) {
    player.facingRight = dir > 0;
    ralphSprite.scale.x = player.facingRight ? 1.6 : -1.6;
  }

  if ((keys['KeyW'] || keys['ArrowUp'] || keys['Space']) && player.onGround) {
    player.vel.y    = PHYSICS.jumpForce;
    player.onGround = false;
  }

  player.vel.y += PHYSICS.gravity * dt;
  player.pos.x += player.vel.x * dt;
  player.pos.y += player.vel.y * dt;

  player.onGround = false;

  playerBox.setFromCenterAndSize(
    new THREE.Vector3(player.pos.x, player.pos.y + player.height / 2, 0.5),
    new THREE.Vector3(player.width, player.height, 0.6)
  );

  for (const plat of platforms) {
    if (playerBox.intersectsBox(plat.box)) {
      const platTop = plat.def.y + 0.16;
      if (player.vel.y <= 0 && player.pos.y >= platTop - 0.5) {
        player.pos.y    = platTop;
        player.vel.y    = 0;
        player.onGround = true;
      } else if (player.vel.y > 0 && player.pos.y + player.height <= plat.def.y + 0.5) {
        player.pos.y = plat.def.y - player.height;
        player.vel.y = 0;
      }
    }
  }

  player.pos.x = Math.max(-4.5, Math.min(4.5, player.pos.x));

  if (player.pos.y < -4) loseLife();

  ralphSprite.position.set(player.pos.x, player.pos.y + player.height / 2, 0.5);
}

// ── AUDIO ─────────────────────────────────────
const bgMusic    = new Audio(PATHS.music);
bgMusic.loop     = true;
bgMusic.volume   = 0.6;

function startMusic() {
  bgMusic.play().catch(() => {
    document.addEventListener('click', () => bgMusic.play(), { once: true });
  });
}

// ── TEMPORIZADOR ──────────────────────────────
function startTimer() {
  clearInterval(GAME.timerInterval);
  GAME.timeLeft = 60;
  updateTimerHUD();
  GAME.timerInterval = setInterval(() => {
    if (GAME.paused || GAME.state !== 'playing') return;
    GAME.timeLeft--;
    updateTimerHUD();
    if (GAME.timeLeft <= 0) {
      clearInterval(GAME.timerInterval);
      triggerGameOver();
    }
  }, 1000);
}

function updateTimerHUD() {
  const el  = document.getElementById('timer-display');
  const sec = Math.max(0, GAME.timeLeft);
  el.textContent = `${String(Math.floor(sec / 60)).padStart(2,'0')}:${String(sec % 60).padStart(2,'0')}`;
  el.classList.toggle('danger', sec <= 10);
}

// ── GAME LOGIC ────────────────────────────────
function loseLife() {
  GAME.lives = Math.max(0, GAME.lives - 1);
  updateHUD();
  if (GAME.lives <= 0) {
    triggerGameOver();
  } else {
    player.pos.set(0, 0.3, 0.5);
    player.vel.set(0, 0, 0);
  }
}

function togglePause() {
  GAME.paused = !GAME.paused;
  if (GAME.paused) bgMusic.pause();
  else             bgMusic.play();
}

function triggerGameOver() {
  GAME.state = 'gameover';
  clearInterval(GAME.timerInterval);
  bgMusic.pause();
  bgMusic.currentTime = 0;
  document.getElementById('gameover-screen').style.display = 'flex';
  document.getElementById('final-score-display').textContent =
    'PUNTOS: ' + String(GAME.score).padStart(6, '0');
}

function startGame() {
  GAME.state    = 'playing';
  GAME.score    = 0;
  GAME.lives    = 3;
  GAME.paused   = false;
  player.pos.set(0, 0.3, 0.5);
  player.vel.set(0, 0, 0);
  player.onGround = false;
  document.getElementById('title-screen').style.display    = 'none';
  document.getElementById('gameover-screen').style.display = 'none';
  updateHUD();
  startTimer();
  startMusic();
}

// ── HUD ───────────────────────────────────────
const livesMap = ['', '♥', '♥ ♥', '♥ ♥ ♥'];

function updateHUD() {
  document.getElementById('score-display').textContent =
    String(GAME.score).padStart(6, '0');
  document.getElementById('lives-display').textContent =
    livesMap[Math.max(0, Math.min(GAME.lives, 3))] || '';
}
updateHUD();

// ── CONFIGURACIONES ───────────────────────────
const settingsModal = document.getElementById('settings-modal');

document.getElementById('btn-settings').addEventListener('click', () => {
  const wasPlaying = GAME.state === 'playing' && !GAME.paused;
  if (wasPlaying) togglePause();
  settingsModal.style.display = 'flex';
  settingsModal.dataset.wasPlaying = wasPlaying;
});

document.getElementById('close-settings').addEventListener('click', () => {
  settingsModal.style.display = 'none';
  if (settingsModal.dataset.wasPlaying === 'true' && GAME.state === 'playing') togglePause();
});

const volSlider = document.getElementById('vol-slider');
const volValue  = document.getElementById('vol-value');
volSlider.addEventListener('input', () => {
  volValue.textContent = volSlider.value + '%';
  bgMusic.volume = volSlider.value / 100;
});

document.getElementById('mute-toggle').addEventListener('change', e => {
  bgMusic.muted = e.target.checked;
});

function setBgColor(color) {
  GAME.bgColor = color;
  document.body.style.background = color;
  renderer.setClearColor(new THREE.Color(color));
}

document.querySelectorAll('.color-swatch').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setBgColor(btn.dataset.color);
    document.getElementById('custom-color').value = btn.dataset.color;
  });
});

document.getElementById('custom-color').addEventListener('input', e => {
  document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
  setBgColor(e.target.value);
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

// ── LOOP ──────────────────────────────────────
const clock = new THREE.Clock();

function gameLoop() {
  requestAnimationFrame(gameLoop);
  const dt = Math.min(clock.getDelta(), 0.05);
  updatePlayer(dt);
  rimLight.intensity = 0.8 + Math.sin(clock.elapsedTime * 1.8) * 0.2;
  renderer.render(scene, camera);
}

gameLoop();