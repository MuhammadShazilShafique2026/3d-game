
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const $ = id => document.getElementById(id);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9dc5d5);
scene.fog = new THREE.Fog(0x9dc5d5, 90, 310);

const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.1, 700);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xd7eeff, 0x68604b, 2));

const sun = new THREE.DirectionalLight(0xfff1d4, 3.2);
sun.position.set(-65, 100, 45);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -100;
sun.shadow.camera.right = 100;
sun.shadow.camera.top = 100;
sun.shadow.camera.bottom = -100;
sun.shadow.bias = -0.00025;
scene.add(sun);

const mat = (color, roughness = 0.8, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const materials = {
  road: mat(0x353b40),
  sidewalk: mat(0xb5ad9d),
  line: mat(0xf3e7c2),
  grass: mat(0x708c5b),
  white: mat(0xe8e4d8),
  black: mat(0x20252a),
  glass: new THREE.MeshStandardMaterial({
    color: 0x8fb8c8,
    roughness: 0.24,
    metalness: 0.25
  }),
  tyre: mat(0x17191b),
  metal: mat(0x777f83, 0.35, 0.65),
  red: mat(0xc62c25),
  yellow: mat(0xf1b52e),
  blue: mat(0x2567a6),
  green: mat(0x39805a),
  cream: mat(0xe0d0ad)
};

const boxGeo = new THREE.BoxGeometry(1, 1, 1);

function box(parent, name, pos, scale, material, shadow = true) {
  const mesh = new THREE.Mesh(boxGeo, material);
  mesh.name = name;
  mesh.position.set(...pos);
  mesh.scale.set(...scale);
  mesh.castShadow = shadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cylinder(parent, pos, r1, r2, h, material, rot = [0, 0, 0], segments = 12) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(r1, r2, h, segments),
    material
  );
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(650, 650),
  materials.grass
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.16;
ground.receiveShadow = true;
scene.add(ground);

// Indian-style city
const city = new THREE.Group();
scene.add(city);

function road(x, z, w, d) {
  box(city, 'road', [x, 0, z], [w, 0.12, d], materials.road, false);

  if (w > d) {
    for (let p = -w / 2 + 5; p < w / 2 - 2; p += 9) {
      box(city, 'lane', [x + p, 0.067, z], [4, 0.012, 0.12], materials.line, false);
    }
  } else {
    for (let p = -d / 2 + 5; p < d / 2 - 2; p += 9) {
      box(city, 'lane', [x, 0.067, z + p], [0.12, 0.012, 4], materials.line, false);
    }
  }
}

for (let k = -2; k <= 2; k++) {
  road(k * 62, 0, 13, 330);
  road(0, k * 62, 330, 13);

  for (const side of [-1, 1]) {
    box(city, 'walk', [k * 62 + side * 8, 0.02, 0],
      [2, 0.2, 330], materials.sidewalk, false);

    box(city, 'walk', [0, 0.02, k * 62 + side * 8],
      [330, 0.2, 2], materials.sidewalk, false);
  }
}

function seeded(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Buildings
const buildingColors = [
  0xd9c8a5, 0xc9b4a0, 0xb7c4c5, 0xd8d5c7,
  0xd0b18b, 0xaebcaa, 0xe0d0b8, 0xc2b0bd
];

let buildingIndex = 0;

for (let gx = -2; gx < 3; gx++) {
  for (let gz = -2; gz < 3; gz++) {
    for (let i = 0; i < 18; i++) {
      const x = gx * 62 + (seeded(buildingIndex + 2) - 0.5) * 46;
      const z = gz * 62 + (seeded(buildingIndex + 6) - 0.5) * 46;

      const nearRoad = [-2, -1, 0, 1, 2].some(
        k => Math.abs(x - k * 62) < 14 || Math.abs(z - k * 62) < 14
      );

      if (nearRoad) {
        buildingIndex++;
        continue;
      }

      const w = 5 + seeded(buildingIndex + 1) * 9;
      const d = 5 + seeded(buildingIndex + 3) * 9;
      const h = 7 + seeded(buildingIndex + 4) * 24;

      const group = new THREE.Group();
      group.position.set(x, 0, z);
      city.add(group);

      const wall = mat(
        buildingColors[Math.floor(seeded(buildingIndex + 5) * buildingColors.length)]
      );

      box(group, 'building', [0, h / 2, 0], [w, h, d], wall);
      box(group, 'roofline', [0, h + 0.15, 0], [w + 0.35, 0.3, d + 0.35], mat(0xaaa79d));

      if (seeded(buildingIndex + 9) > 0.45) {
        cylinder(group, [w * 0.18, h + 1, 0], 0.8, 0.8, 1.8, mat(0x8e9898));
      }

      const winMat = mat(0x52727a, 0.4, 0.12);
      const floors = Math.max(2, Math.floor(h / 3.2));

      for (let f = 0; f < floors; f++) {
        const count = Math.max(1, Math.floor(w / 2.5));

        for (let j = 0; j < count; j++) {
          const wx = -w / 2 + 1.2 +
            j * (w - 2.4) / Math.max(1, count - 1);

          box(group, 'window', [wx, 1.8 + f * 3, d / 2 + 0.015],
            [0.85, 1.15, 0.04], winMat, false);
        }
      }

      if (seeded(buildingIndex + 10) > 0.35) {
        const signs = [
          materials.red, materials.blue, materials.green, materials.yellow
        ];

        box(group, 'shop-sign', [0, 2.8, d / 2 + 0.08],
          [w * 0.72, 0.65, 0.12],
          signs[Math.floor(seeded(buildingIndex + 12) * 4)], false);

        box(group, 'awning', [0, 2.1, d / 2 + 0.15],
          [w * 0.75, 0.12, 0.7], materials.cream, false);
      }

      buildingIndex++;
    }
  }
}

// Street lights
for (let x = -124; x <= 124; x += 31) {
  for (const z of [-11, 11]) {
    cylinder(city, [x, 2.5, z], 0.09, 0.12, 5, materials.metal);
    cylinder(city, [x + 0.7, 4.8, z], 0.08, 0.08, 1.5,
      materials.metal, [0, 0, Math.PI / 2]);

    box(city, 'lamp', [x + 1.35, 4.75, z],
      [0.7, 0.18, 0.35], mat(0xffe4a0, 0.35), false);
  }
}

// Trees
function makeTree(x, z) {
  cylinder(city, [x, 1.1, z], 0.22, 0.32, 2.2, mat(0x72503a));

  const greens = [0x3f7548, 0x4e8249, 0x5c8a4f];
  const crown = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.35, 1),
    mat(greens[Math.floor(seeded(x + z + 8) * 3)])
  );

  crown.position.set(x, 2.8, z);
  crown.scale.set(1, 1.15, 1);
  crown.castShadow = true;
  city.add(crown);
}

for (let gx = -2; gx <= 2; gx++) {
  for (let gz = -2; gz <= 2; gz++) {
    for (const side of [-1, 1]) {
      makeTree(gx * 62 + side * 11, gz * 62 + 19);
      makeTree(gx * 62 + side * 11, gz * 62 - 19);
    }
  }
}

// Landmark
const temple = new THREE.Group();
temple.position.set(-26, 0, -25);
city.add(temple);

box(temple, 'temple', [0, 3, 0], [8, 6, 8], mat(0xd7a75d));
box(temple, 'temple door', [0, 1.6, 4.05], [1.6, 3.2, 0.15], mat(0x513b2a));
cylinder(temple, [0, 7, 0], 0, 2.5, 3.2, mat(0xb84d2b), [0, 0, 0], 4);
cylinder(temple, [0, 9.2, 0], 0.12, 0.12, 1.5, materials.metal);

const tower = new THREE.Group();
tower.position.set(44, 0, -83);
city.add(tower);
cylinder(tower, [0, 7, 0], 2.8, 2.8, 1.3, mat(0x9caaa9));
cylinder(tower, [0, 3.5, 0], 0.18, 0.25, 6, materials.metal);

// People
function makePerson(shirt = 0x2b69a0, pants = 0x282d35) {
  const g = new THREE.Group();
  const skin = mat(0x9a6848);
  const top = mat(shirt);
  const bottom = mat(pants);
  const shoe = mat(0x202124);

  cylinder(g, [0, 1.42, 0], 0.25, 0.3, 0.68, top);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 10), skin
  );
  head.position.set(0, 1.95, 0);
  head.castShadow = true;
  g.add(head);

  cylinder(g, [-0.32, 1.4, 0], 0.09, 0.12, 0.6, top, [0, 0, -0.25]);
  cylinder(g, [0.32, 1.4, 0], 0.09, 0.12, 0.6, top, [0, 0, 0.25]);
  cylinder(g, [-0.12, 0.65, 0], 0.12, 0.14, 0.72, bottom);
  cylinder(g, [0.12, 0.65, 0], 0.12, 0.14, 0.72, bottom);

  box(g, 'shoeL', [-0.12, 0.13, -0.1], [0.22, 0.15, 0.42], shoe);
  box(g, 'shoeR', [0.12, 0.13, -0.1], [0.22, 0.15, 0.42], shoe);

  return g;
}

const player = makePerson(0x1b4d73, 0x272b31);
player.position.set(0, 0, 5);
scene.add(player);

const keys = {};
let onFoot = true;
let activeVehicle = null;
let playerYaw = Math.PI;
let carSpeed = 0;
let wanted = 0;
let policeTimer = 0;
let toastTimer = null;

const vehicles = [];
const policeCars = [];
const pedestrians = [];

function wheel(parent, x, y, z, r = 0.38) {
  const w = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, 0.22, 16),
    materials.tyre
  );

  w.rotation.z = Math.PI / 2;
  w.position.set(x, y, z);
  w.castShadow = true;
  parent.add(w);

  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.45, r * 0.45, 0.235, 12),
    materials.metal
  );

  hub.rotation.z = Math.PI / 2;
  hub.position.copy(w.position);
  parent.add(hub);

  return w;
}

// Cars and police cars
function makeCar(color = 0xd5d8d8, police = false) {
  const g = new THREE.Group();
  const bodyMat = mat(color, 0.4, 0.18);

  box(g, 'car-body', [0, 0.72, 0], [2.05, 0.68, 4.1], bodyMat);
  box(g, 'car-hood', [0, 1.02, -1.25], [1.9, 0.28, 1.25], bodyMat);
  box(g, 'car-cabin', [0, 1.42, 0.25], [1.55, 0.78, 2.05], materials.glass);
  box(g, 'roof', [0, 1.84, 0.25], [1.48, 0.12, 1.9], bodyMat);

  box(g, 'bumperF', [0, 0.48, -2.08], [2.1, 0.18, 0.16], materials.metal);
  box(g, 'bumperR', [0, 0.48, 2.08], [2.1, 0.18, 0.16], materials.metal);

  for (const x of [-0.72, 0.72]) {
    box(g, 'headlight', [x, 0.82, -2.08],
      [0.35, 0.18, 0.06], mat(0xfff1b4, 0.25));

    box(g, 'taillight', [x, 0.82, 2.08],
      [0.3, 0.18, 0.06], mat(0xe22c25, 0.3));
  }

  for (const x of [-1, 1]) {
    for (const z of [-1.35, 1.35]) {
      wheel(g, x, 0.43, z, 0.39);
    }
  }

  if (police) {
    box(g, 'police stripe', [0, 1.02, 0], [2.06, 0.12, 1.8], mat(0xf1f1f1));
    box(g, 'lightbar', [0, 2, 0], [0.85, 0.16, 0.28], mat(0x252a30));
    box(g, 'redlight', [-0.25, 2, 0], [0.28, 0.18, 0.3], mat(0xe82132, 0.3));
    box(g, 'bluelight', [0.25, 2, 0], [0.28, 0.18, 0.3], mat(0x167bff, 0.3));
    box(g, 'police label', [0, 1.35, 1.28], [0.7, 0.3, 0.04], mat(0x182b46));
  }

  g.userData = {
    type: police ? 'police' : 'car',
    speed: 0,
    stolen: false,
    police
  };

  return g;
}

// Indian-style motorcycle
function makeBike(color = 0x24282b) {
  const g = new THREE.Group();
  const paint = mat(color, 0.38, 0.18);

  for (const z of [-0.95, 0.92]) {
    const tire = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.09, 8, 16),
      materials.tyre
    );

    tire.position.set(0, 0.42, z);
    tire.rotation.y = Math.PI / 2;
    tire.castShadow = true;
    g.add(tire);

    cylinder(g, [0, 0.42, z], 0.08, 0.08, 0.17,
      materials.metal, [0, 0, Math.PI / 2], 12);
  }

  box(g, 'bike-frame', [0, 0.8, 0], [0.16, 0.16, 1.25], materials.red);
  box(g, 'bike-tank', [0, 1.03, -0.15], [0.48, 0.35, 0.62], paint);
  box(g, 'bike-seat', [0, 1.13, 0.42], [0.38, 0.13, 0.55], materials.black);
  box(g, 'bike-engine', [0, 0.65, 0.15], [0.48, 0.42, 0.42], materials.metal);

  cylinder(g, [-0.38, 1.3, -0.8], 0.045, 0.045, 0.9,
    materials.metal, [0, 0, Math.PI / 2]);

  box(g, 'headlamp', [0, 1.15, -0.96],
    [0.25, 0.23, 0.18], mat(0xfff2b4, 0.3));

  g.userData = { type: 'bike', speed: 0, stolen: false };
  return g;
}

function addVehicle(v, x, z, yaw = 0) {
  v.position.set(x, 0, z);
  v.rotation.y = yaw;
  scene.add(v);
  vehicles.push(v);
  return v;
}

// Traffic
const colors = [
  0xd6d7d2, 0x1d4d80, 0xc83b2c, 0xd7aa31,
  0x4d7558, 0x282c30, 0xc8c0b1, 0x7b477f
];

let vi = 0;

for (let lane = -2; lane <= 2; lane++) {
  for (let i = 0; i < 5; i++) {
    const z = -120 + i * 52 + (lane % 2 ? 16 : 0);
    const x = lane * 62 + (lane > 0 ? -11 : 11);

    const v = addVehicle(makeCar(colors[vi++ % colors.length]), x, z, Math.PI);
    v.userData.speed = 5 + seeded(vi + 4) * 5;
    v.userData.cruise = true;
  }
}

for (let i = 0; i < 12; i++) {
  const x = (i % 4 - 1.5) * 62 + (i % 2 ? 11 : -11);
  const z = -135 + Math.floor(i / 4) * 125;

  const bike = addVehicle(
    makeBike([0x24282b, 0xc02e26, 0x1d4e80, 0xddd6c3][i % 4]),
    x, z, Math.PI
  );

  bike.userData.speed = 3 + seeded(i + 91) * 3;
  bike.userData.cruise = true;
}

// Pedestrians
for (let i = 0; i < 26; i++) {
  let x = (Math.floor(i / 5) - 2) * 62 + (i % 2 ? 12 : -12);
  const z = -140 + (i % 5) * 66;

  if (Math.abs(x) < 9) x += 12;

  const p = makePerson(
    [0x8c392c, 0x286b65, 0xc48a27, 0x365c94, 0x7e4c82][i % 5],
    [0x272c31, 0x45433b, 0x202d3a][i % 3]
  );

  p.position.set(x, 0, z);
  p.rotation.y = seeded(i + 200) * Math.PI * 2;
  scene.add(p);
  pedestrians.push(p);
}

// Police chase
function spawnPolice() {
  if (policeCars.length >= 3) return;

  const v = makeCar(0x152a48, true);
  const target = activeVehicle ? activeVehicle.position : player.position;

  v.position.set(target.x + 18, 0, target.z + 25);
  v.rotation.y = Math.PI;

  scene.add(v);
  policeCars.push(v);
}

function showToast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    $('toast').classList.remove('show');
  }, 2300);
}

function startWanted() {
  wanted = Math.min(5, Math.max(1, wanted + 1));
  policeTimer = 0;

  $('wanted').textContent = '★'.repeat(wanted) + '☆'.repeat(5 - wanted);
  $('policeAlert').style.display = 'block';
  $('mission').textContent = 'Escape the police and lose your wanted level.';

  spawnPolice();
  showToast('VEHICLE STOLEN — POLICE CHASE ACTIVATED!');
}

function nearestVehicle() {
  let best = null;
  let distance = 5.5;

  for (const v of vehicles) {
    const d = v.position.distanceTo(player.position);

    if (d < distance) {
      distance = d;
      best = v;
    }
  }

  return best;
}

function enterExit() {
  if (!onFoot) {
    if (activeVehicle) {
      player.position.copy(activeVehicle.position);
      player.position.x += 2.5;
      player.position.y = 0;
      player.visible = true;

      activeVehicle = null;
      onFoot = true;
      carSpeed = 0;

      showToast('You exited the vehicle.');
    }

    return;
  }

  const v = nearestVehicle();

  if (!v) {
    showToast('Move closer to a car or motorcycle.');
    return;
  }

  onFoot = false;
  activeVehicle = v;
  player.visible = false;
  carSpeed = 0;

  if (!v.userData.stolen) {
    v.userData.stolen = true;
    startWanted();
  }

  $('vehicleName').textContent =
    v.userData.type === 'bike' ? 'MOTORCYCLE' : 'STOLEN CAR';

  $('mission').textContent = 'Drive through the city. Avoid the police.';

  showToast(v.userData.type === 'bike'
    ? 'Motorcycle mounted.'
    : 'Car stolen — drive!');
}

// Keyboard controls
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  keys[k] = true;

  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
    e.preventDefault();
  }

  if (k === 'e' && !e.repeat) enterExit();
  if (k === 'r' && !e.repeat) resetPlayer();
});

window.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

function resetPlayer() {
  if (activeVehicle) {
    activeVehicle.position.set(0, 0, 5);
    activeVehicle.rotation.y = Math.PI;
    activeVehicle.userData.speed = 0;
    activeVehicle = null;
  }

  player.position.set(0, 0, 5);
  player.rotation.y = Math.PI;
  playerYaw = Math.PI;
  player.visible = true;

  onFoot = true;
  carSpeed = 0;
  wanted = 0;
  policeTimer = 0;
  walkSpeed = 0;

  policeCars.forEach(p => scene.remove(p));
  policeCars.length = 0;

  $('wanted').textContent = '☆☆☆☆☆';
  $('policeAlert').style.display = 'none';
  $('vehicleName').textContent = 'ON FOOT';
  $('mission').textContent = 'Find a vehicle and press E to enter.';

  showToast('Position reset.');
}

// Help panel
$('helpToggle').onclick = () => {
  const content = $('helpContent');
  content.style.display = content.style.display === 'none' ? 'block' : 'none';
  $('helpToggle').textContent = content.style.display === 'none' ? '+' : '−';
};

// Mobile enter/exit button
$('mobileE').addEventListener('pointerdown', e => {
  e.preventDefault();
  enterExit();
});

// Mobile movement controls
document.querySelectorAll('[data-key]').forEach(button => {
  const key = button.dataset.key;

  button.addEventListener('pointerdown', e => {
    e.preventDefault();
    keys[key] = true;
    button.setPointerCapture?.(e.pointerId);
  });

  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(eventName => {
    button.addEventListener(eventName, () => {
      keys[key] = false;
    });
  });
});

// Player movement
const clock = new THREE.Clock();
const forward = new THREE.Vector3();
const desiredCamera = new THREE.Vector3();
const lookTarget = new THREE.Vector3();

function moveOnFoot(dt) {
  const turn =
    (keys.a || keys.arrowleft ? 1 : 0) -
    (keys.d || keys.arrowright ? 1 : 0);

  const move =
    (keys.w || keys.arrowup ? 1 : 0) -
    (keys.s || keys.arrowdown ? 1 : 0);

  if (turn) playerYaw += turn * dt * 2.2;

  if (move) {
    forward.set(Math.sin(playerYaw), 0, Math.cos(playerYaw));
    player.position.addScaledVector(forward, -move * dt * 5.2);
    player.position.y = 0;
  }

  player.rotation.y = playerYaw;
}

function moveVehicle(v, dt) {
  const isBike = v.userData.type === 'bike';

  const throttle =
    (keys.w || keys.arrowup ? 1 : 0) -
    (keys.s || keys.arrowdown ? 1 : 0);

  const steer =
    (keys.a || keys.arrowleft ? 1 : 0) -
    (keys.d || keys.arrowright ? 1 : 0);

  const maxSpeed = isBike ? 25 : 34;
  const acceleration = isBike ? 16 : 20;

  v.userData.speed += throttle * acceleration * dt;

  if (!throttle) {
    v.userData.speed *= Math.pow(0.965, dt * 60);
  }

  v.userData.speed = THREE.MathUtils.clamp(
    v.userData.speed,
    -maxSpeed * 0.35,
    maxSpeed
  );

  if (keys[' ']) {
    v.userData.speed *= Math.pow(0.88, dt * 60);
  }

  const speedFactor = Math.min(1, Math.abs(v.userData.speed) / 6);

  v.rotation.y += steer * dt * (1.6 * speedFactor) *
    (v.userData.speed >= 0 ? 1 : -1);

  forward.set(Math.sin(v.rotation.y), 0, Math.cos(v.rotation.y));
  v.position.addScaledVector(forward, -v.userData.speed * dt);

  v.position.x = THREE.MathUtils.clamp(v.position.x, -155, 155);
  v.position.z = THREE.MathUtils.clamp(v.position.z, -155, 155);

  // Vehicle collision
  for (const other of vehicles) {
    if (other === v) continue;

    const delta = v.position.clone().sub(other.position);
    delta.y = 0;

    if (delta.length() < 2.35) {
      delta.normalize();
      v.position.addScaledVector(delta, 0.16);
      v.userData.speed *= 0.86;
    }
  }

  if (isBike) {
    v.rotation.z = -steer * 0.06 * speedFactor;
  }

  $('speed').textContent = Math.round(Math.abs(v.userData.speed) * 3.6);
}

// Traffic movement
function updateTraffic(dt) {
  for (const v of vehicles) {
    if (v === activeVehicle) continue;

    if (v.userData.cruise) {
      const direction = new THREE.Vector3(
        Math.sin(v.rotation.y), 0, Math.cos(v.rotation.y)
      );

      v.position.addScaledVector(direction, -v.userData.speed * dt);

      if (v.position.z < -158) v.position.z = 158;
      if (v.position.z > 158) v.position.z = -158;
      if (v.position.x < -158) v.position.x = 158;
      if (v.position.x > 158) v.position.x = -158;
    }
  }

  for (const p of pedestrians) {
    p.userData.phase = (p.userData.phase || Math.random() * 10) + dt;
    p.position.x += Math.sin(p.userData.phase * 0.4) * dt * 0.22;
  }
}

// Police AI
function updatePolice(dt) {
  if (wanted <= 0) return;

  policeTimer += dt;

  if (policeTimer > 5 && policeCars.length < Math.min(3, 1 + Math.floor(wanted / 2))) {
    spawnPolice();
    policeTimer = 0;
  }

  const target = activeVehicle || player;

  for (const police of policeCars) {
    const dx = target.position.x - police.position.x;
    const dz = target.position.z - police.position.z;
    const distance = Math.hypot(dx, dz);

    const targetYaw = Math.atan2(dx, dz);

    let diff = ((targetYaw - police.rotation.y + Math.PI * 3) %
      (Math.PI * 2)) - Math.PI;

    police.rotation.y += THREE.MathUtils.clamp(diff, -dt * 1.7, dt * 1.7);

    const speed = distance > 5 ? Math.min(25, 9 + wanted * 2) : 0;

    police.position.x += Math.sin(police.rotation.y) * speed * dt;
    police.position.z += Math.cos(police.rotation.y) * speed * dt;

    police.position.x = THREE.MathUtils.clamp(police.position.x, -158, 158);
    police.position.z = THREE.MathUtils.clamp(police.position.z, -158, 158);

    if (distance < 3.2 && activeVehicle) {
      activeVehicle.userData.speed *= 0.96;
    }
  }

  const nearest = Math.min(
    ...policeCars.map(p => p.position.distanceTo(target.position))
  );

  if (nearest > 95) {
    target.userData.escape = (target.userData.escape || 0) + dt;
  } else {
    target.userData.escape = 0;
  }

  if (target.userData.escape > 18) {
    wanted = 0;
    $('wanted').textContent = '☆☆☆☆☆';
    $('policeAlert').style.display = 'none';
    $('mission').textContent = 'You escaped. Explore the city!';

    policeCars.forEach(p => scene.remove(p));
    policeCars.length = 0;
    target.userData.escape = 0;

    showToast('CHASE LOST — YOU ESCAPED!');
  }
}

// Third-person camera
function updateCamera(dt) {
  const target = activeVehicle || player;
  const yaw = activeVehicle ? activeVehicle.rotation.y : playerYaw;

  const distance = activeVehicle
    ? (activeVehicle.userData.type === 'bike' ? 8.5 : 10)
    : 7;

  const height = activeVehicle ? 4.5 : 3.4;

  desiredCamera.set(
    target.position.x + Math.sin(yaw) * distance,
    target.position.y + height,
    target.position.z + Math.cos(yaw) * distance
  );

  camera.position.lerp(desiredCamera, 1 - Math.pow(0.001, dt));

  lookTarget.set(
    target.position.x,
    target.position.y + (activeVehicle ? 1.1 : 1.5),
    target.position.z
  );

  camera.lookAt(lookTarget);
}

// Main game loop
function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.04);

  if (onFoot) {
    moveOnFoot(dt);
    $('speed').textContent = '0';
    $('vehicleName').textContent = 'ON FOOT';
  } else if (activeVehicle) {
    moveVehicle(activeVehicle, dt);

    $('vehicleName').textContent =
      activeVehicle.userData.type === 'bike'
        ? 'MOTORCYCLE'
        : 'STOLEN CAR';
  }

  updateTraffic(dt);
  updatePolice(dt);
  updateCamera(dt);

  renderer.render(scene, camera);
}

// Responsive canvas
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
});

camera.position.set(0, 5, 15);
camera.lookAt(0, 0, 0);

animate();

setTimeout(() => {
  const loading = $('loading');

  if (loading) {
    loading.style.opacity = '0';
    setTimeout(() => loading.remove(), 550);
  }

  showToast('Welcome to Indian City. Walk to a vehicle and press E.');
}, 900);
