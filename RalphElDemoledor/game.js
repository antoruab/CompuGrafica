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
  gravity:   -22,
  jumpForce:  28, 
  moveSpeed:   6,
};

// ── RUTAS DE ARCHIVOS ──────────────────────────
const PATHS = {
  building:     'src/img/Edificio.png',
  ralph:        'src/img/Ralph.png',
  felix:        'src/img/Felix.png',
  windowBroken: 'src/img/Ventana_Rota.png',
  settingsIcon: 'src/img/configuracion.png',
  music:        'src/audio/Soundtrack.mp3',
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
const PLATFORM_DEFS = [
  { x: 0, y: 0.1,  w: 9.0 },
  { x: 0, y: 3.05, w: 8.5 },
  { x: 0, y: 6.15, w: 8.5 },
  { x: 0, y: 9.0,  w: 8.5 },
  { x: 0, y: 11.7, w: 8.5 },
  { x: 0, y: 14.2, w: 8.0 },
];

// Materiales invisibles pero con física activa
const platMat = new THREE.MeshStandardMaterial({
  visible: false 
});

const platEdgeMat = new THREE.MeshStandardMaterial({
  visible: false 
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

// ── VENTANAS ──────────────────────────────────
const WINDOW_DEFS = [
  { x: -2.5, y: 3.4,   floor: 1 }, { x: 0.0, y: 3.4,   floor: 1 }, { x: 2.5, y: 3.4,   floor: 1 },
  { x: -2.5, y: 6.5,   floor: 2 }, { x: 0.0, y: 6.5,   floor: 2 }, { x: 2.5, y: 6.5,   floor: 2 },
  { x: -2.5, y: 9.35,  floor: 3 }, { x: 0.0, y: 9.35,  floor: 3 }, { x: 2.5, y: 9.35,  floor: 3 },
  { x: -2.5, y: 12.05, floor: 4 }, { x: 0.0, y: 12.05, floor: 4 }, { x: 2.5, y: 12.05, floor: 4 },
  { x: -2.5, y: 14.55, floor: 5 }, { x: 0.0, y: 14.55, floor: 5 }, { x: 2.5, y: 14.55, floor: 5 },
];

const brokenTex = texLoader.load(PATHS.windowBroken);

const windows3D = [];

WINDOW_DEFS.forEach(def => {
  const mat = new THREE.MeshStandardMaterial({
    color: 0x88ccff, emissive: 0x004488, emissiveIntensity: 0.5,
    transparent: true, opacity: 0.85,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), mat);
  mesh.position.set(def.x, def.y, 0.01);
  scene.add(mesh);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(0.76, 0.96, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9 })
  );
  frame.position.set(def.x, def.y, -0.02);
  scene.add(frame);

  const crackGroup = new THREE.Group();
  crackGroup.position.set(def.x, def.y, 0.03);
  crackGroup.visible = false;
  crackGroup.add(
    Object.assign(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.1, 0.3, 0), new THREE.Vector3(0.15, -0.1, 0), new THREE.Vector3(0.05, -0.4, 0)
      ]),
      new THREE.LineBasicMaterial({ color: 0x000000 })
    )),
    Object.assign(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.1, 0.2, 0), new THREE.Vector3(-0.2, -0.05, 0), new THREE.Vector3(-0.15, -0.35, 0)
      ]),
      new THREE.LineBasicMaterial({ color: 0x222222 })
    ))
  );
  scene.add(crackGroup);

  windows3D.push({ def, mesh, crackGroup, hitCount: 0, state: 'intact' });
});

// Modificado: Ahora se rompe al primer golpe
function hitWindow(win) {
  if (win.state === 'broken') {
    loseLife();
    showPopup(win.def.x, win.def.y, '💥 -VIDA', true);
    return;
  }
  
  win.state = 'broken';
  win.mesh.material.map = brokenTex;
  win.mesh.material.color.set(0xffffff);
  win.mesh.material.emissive.set(0x000000);
  win.mesh.material.emissiveIntensity = 0;
  win.mesh.material.opacity = 1.0;
  win.mesh.material.needsUpdate = true;
  win.crackGroup.visible = false; 
  
  GAME.score += 50;
  updateHUD();
  showPopup(win.def.x, win.def.y, '+50', false);
}

function repairWindow(win) {
  if (win.state === 'intact') return;
  win.state    = 'intact';
  win.hitCount = 0;
  win.mesh.material.map = null;
  win.mesh.material.color.set(0x88ccff);
  win.mesh.material.emissive.set(0x004488);
  win.mesh.material.emissiveIntensity = 0.5;
  win.mesh.material.opacity = 0.85;
  win.mesh.material.needsUpdate = true;
  win.crackGroup.visible = false;
  win.mesh.material.emissiveIntensity = 2.0;
  setTimeout(() => { win.mesh.material.emissiveIntensity = 0.5; }, 350);
}

function resetWindows() {
  windows3D.forEach(w => {
    w.hitCount = 0; w.state = 'intact';
    w.mesh.material.map = null;
    w.mesh.material.color.set(0x88ccff);
    w.mesh.material.emissive.set(0x004488);
    w.mesh.material.emissiveIntensity = 0.5;
    w.mesh.material.opacity = 0.85;
    w.mesh.material.needsUpdate = true;
    w.crackGroup.visible = false;
  });
}

// ── POPUP HUD ─────────────────────────────────
function showPopup(wx, wy, text, bad) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = `
    position:absolute; font-family:'Press Start 2P',monospace; font-size:11px;
    color:${bad ? '#e8534a' : '#f4c542'}; pointer-events:none; z-index:25;
    text-shadow:2px 2px 0 #000; transform:translateX(-50%);
    animation:_popup 0.9s ease-out forwards;
  `;
  const v = new THREE.Vector3(wx, wy + 1.0, 0).project(camera);
  const wrap = document.getElementById('game-wrapper');
  el.style.left = ((v.x * 0.5 + 0.5) * wrap.clientWidth)  + 'px';
  el.style.top  = ((-v.y * 0.5 + 0.5) * wrap.clientHeight) + 'px';
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

if (!document.getElementById('_popup-style')) {
  const s = document.createElement('style');
  s.id = '_popup-style';
  s.textContent = `
    @keyframes _popup {
      0%   { opacity:1; transform:translateX(-50%) translateY(0); }
      100% { opacity:0; transform:translateX(-50%) translateY(-38px); }
    }
    @keyframes _flash {
      0%   { opacity:1; }
      100% { opacity:0; }
    }
    .felix-alert {
      position:absolute; top:68px; left:50%; transform:translateX(-50%);
      z-index:25; background:rgba(244,197,66,0.12); border:1.5px solid #f4c542;
      border-radius:8px; padding:10px 22px; font-family:'Press Start 2P',monospace;
      font-size:9px; color:#f4c542; pointer-events:none;
      animation:_popup 3s ease-out forwards;
    }
  `;
  document.head.appendChild(s);
}

// ── FELIX ──────────────────────────────────────
const felix = {
  active: false, state: 'idle', pos: new THREE.Vector3(-6, 0.3, 0.5),
  targetWin: null, repairTimer: 0, sprite: null,
};

const felixSprite = new THREE.Sprite(
  new THREE.SpriteMaterial({ map: texLoader.load(PATHS.felix), transparent: true, alphaTest: 0.1 })
);
felixSprite.scale.set(2.4, 3.8, 1); // Felix más grande
felixSprite.visible = false;
scene.add(felixSprite);
felix.sprite = felixSprite;

function activateFelix() {
  if (felix.active) return;
  felix.active = true;
  felix.pos.set(-4.5, 0.3, 0.5);
  felix.sprite.visible = true;
  felix.state = 'idle';
  const el = document.createElement('div');
  el.className = 'felix-alert';
  el.textContent = '🔨 ¡Felix viene a reparar!';
  document.getElementById('game-wrapper').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function updateFelix(dt) {
  if (!felix.active || GAME.state !== 'playing' || GAME.paused) return;

  if (felix.state === 'idle' || felix.state === 'moving') {
    let best = null, bestD = Infinity;
    for (const w of windows3D) {
      if (w.state !== 'intact') {
        const d = Math.abs(w.def.x - felix.pos.x) + Math.abs(w.def.y - felix.pos.y);
        if (d < bestD) { bestD = d; best = w; }
      }
    }
    if (best) {
      felix.targetWin = best;
      felix.state = 'moving';
      const dx = best.def.x - felix.pos.x;
      const dy = (best.def.y - 0.9) - felix.pos.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      if (len > 0.12) {
        felix.pos.x += (dx / len) * 3.5 * dt;
        felix.pos.y += (dy / len) * 3.5 * dt;
      } else {
        felix.state = 'repairing';
        felix.repairTimer = 1.0;
      }
    }
    felix.sprite.position.set(felix.pos.x, felix.pos.y + 0.9, 0.5);
  } else if (felix.state === 'repairing') {
    felix.repairTimer -= dt;
    felix.sprite.position.x = felix.pos.x + Math.sin(Date.now() * 0.025) * 0.06;
    if (felix.repairTimer <= 0 && felix.targetWin) {
      repairWindow(felix.targetWin);
      felix.targetWin = null;
      felix.state = 'idle';
    }
  }
}

function resetFelix() {
  felix.active = false; felix.state = 'idle';
  felix.targetWin = null;
  felix.pos.set(-6, 0.3, 0.5);
  felix.sprite.visible = false;
}

// ── JUGADOR ────────────────────────────────────
const player = {
  sprite:      null,
  vel:         new THREE.Vector3(),
  pos:         new THREE.Vector3(0, 0.3, 0.5),
  onGround:    false,
  facingRight: true,
  width:       0.8,
  height:      1.8,
  canBreak:    true,
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

  if (e.code === 'Space' && GAME.state === 'playing' && !GAME.paused && player.canBreak) {
    player.canBreak = false;
    
    // Hitbox más amplia para detectar fácilmente todas las ventanas
    const pb = new THREE.Box3(
      new THREE.Vector3(player.pos.x - 0.8, player.pos.y - 0.5, -0.5),
      new THREE.Vector3(player.pos.x + 0.8, player.pos.y + player.height + 0.5, 1.2)
    );
    
    for (const win of windows3D) {
      const wb = new THREE.Box3(
        new THREE.Vector3(win.def.x - 0.42, win.def.y - 0.52, -0.2),
        new THREE.Vector3(win.def.x + 0.42, win.def.y + 0.52,  0.5)
      );
      if (pb.intersectsBox(wb)) { hitWindow(win); break; }
    }
  }
});
window.addEventListener('keyup', e => {
  keys[e.code] = false;
  if (e.code === 'Space') player.canBreak = true;
});

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

  if ((keys['KeyW'] || keys['ArrowUp']) && player.onGround) {
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

  // Detectar si el jugador quiere bajar de plataforma
  const isDropping = (keys['KeyS'] || keys['ArrowDown']);

  for (const plat of platforms) {
    if (playerBox.intersectsBox(plat.box)) {
      const platTop = plat.def.y + 0.16;
      
      // Solo aterriza si está cayendo y no está presionando hacia abajo
      if (player.vel.y <= 0 && player.pos.y >= platTop - 0.5) {
        if (!isDropping) {
          player.pos.y    = platTop;
          player.vel.y    = 0;
          player.onGround = true;
        }
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
  bgMusic.currentTime = 0;
  bgMusic.play().catch(() => {});
}

// ── TEMPORIZADOR ──────────────────────────────
let felixActivated = false;

function startTimer() {
  clearInterval(GAME.timerInterval);
  GAME.timeLeft  = 60;
  felixActivated = false;
  updateTimerHUD();
  GAME.timerInterval = setInterval(() => {
    if (GAME.paused || GAME.state !== 'playing') return;
    GAME.timeLeft--;
    updateTimerHUD();
    if (GAME.timeLeft === 45 && !felixActivated) {
      felixActivated = true;
      activateFelix();
    }
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
  const flash = document.createElement('div');
  flash.style.cssText = 'position:absolute;inset:0;background:rgba(232,83,74,0.3);z-index:15;pointer-events:none;animation:_flash 0.4s ease-out forwards';
  document.getElementById('game-wrapper').appendChild(flash);
  setTimeout(() => flash.remove(), 400);
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
  resetWindows();
  resetFelix();
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
  updateFelix(dt);
  rimLight.intensity = 0.8 + Math.sin(clock.elapsedTime * 1.8) * 0.2;
  renderer.render(scene, camera);
}

gameLoop();