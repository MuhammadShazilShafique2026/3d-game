
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b9dc);
scene.fog = new THREE.Fog(0x87b9dc, 80, 250);

const camera = new THREE.PerspectiveCamera(
  65, window.innerWidth / window.innerHeight, 0.1, 500
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x526047, 2));

const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.set(-40, 80, 30);
scene.add(sunlight);

const material = color =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85 });

function createBox(x, y, z, width, height, depth, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material(color)
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  material(0x66834c)
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1;
scene.add(ground);

// Roads
for (let i = -4; i <= 4; i++) {
  createBox(i * 30, 0, 0, 9, 0.08, 270, 0x343b42);
  createBox(0, 0, i * 30, 270, 0.08, 9, 0x343b42);
}

// City buildings
const buildingColors = [
  0xc8b59a, 0xd2d4ce, 0xb6c5cb, 0xd6aa87
];

for (let x = -4; x <= 4; x++) {
  for (let z = -4; z <= 4; z++) {
    if (Math.abs(x) < 1 && Math.abs(z) < 1) continue;

    const height = 8 + Math.random() * 22;

    createBox(
      x * 30 + (Math.random() - 0.5) * 10,
      height / 2,
      z * 30 + (Math.random() - 0.5) * 10,
      7 + Math.random() * 5,
      height,
      7 + Math.random() * 5,
      buildingColors[
        Math.floor(Math.random() * buildingColors.length)
      ]
    );
  }
}

// Character
function createPerson(color = 0x2585b9) {
  const person = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.8, 0.35),
    material(color)
  );
  body.position.y = 1.1;
  person.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 10, 8),
    material(0xc98e65)
  );
  head.position.y = 1.75;
  person.add(head);

  for (const x of [-0.15, 0.15]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.55, 0.17),
      material(0x303846)
    );
    leg.position.set(x, 0.43, 0);
    person.add(leg);
  }

  scene.add(person);
  return person;
}

const player = createPerson();
player.position.set(0, 0, 4);

// Cars
function createCar(color = 0x2677c7) {
  const car = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.7, 4),
    material(color)
  );
  body.position.y = 0.6;
  car.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.65, 1.9),
    material(0x8bb4ca)
  );
  cabin.position.set(0, 1.15, -0.2);
  car.add(cabin);

  for (const x of [-1.05, 1.05]) {
    for (const z of [-1.25, 1.25]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.22, 12),
        material(0x171717)
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.35, z);
      car.add(wheel);
    }
  }

  scene.add(car);
  return car;
}

const cars = [];

for (let i = 0; i < 10; i++) {
  const car = createCar(
    [0xc33d35, 0x2677c7, 0xe4e5e2, 0x2d9a65][i % 4]
  );

  car.position.set(
    i % 2 ? 13 : -13,
    0,
    (i - 4) * 12
  );

  cars.push(car);
}

// Pedestrians
const pedestrians = [];

for (let i = 0; i < 18; i++) {
  const person = createPerson(
    [0x2585b9, 0xd48a32, 0x7a4bb4, 0x3c985e][i % 4]
  );

  person.position.set(
    (Math.random() - 0.5) * 150,
    0,
    (Math.random() - 0.5) * 150
  );

  pedestrians.push(person);
}

// Controls
const keys = {};
let currentCar = null;
let driving = false;
let speed = 0;

window.addEventListener('keydown', event => {
  keys[event.key.toLowerCase()] = true;

  if (event.key.toLowerCase() === 'e') {
    if (driving) {
      player.position.copy(currentCar.position);
      player.position.x += 2.5;
      player.visible = true;
      currentCar = null;
      driving = false;
      speed = 0;
    } else {
      let nearest = null;
      let distance = 5;

      for (const car of cars) {
        const d = car.position.distanceTo(player.position);

        if (d < distance) {
          distance = d;
          nearest = car;
        }
      }

      if (nearest) {
        currentCar = nearest;
        driving = true;
        player.visible = false;
      }
    }
  }
});

window.addEventListener('keyup', event => {
  keys[event.key.toLowerCase()] = false;
});

// Camera and game loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.04);

  if (driving && currentCar) {
    const forward = (keys.w ? 1 : 0) - (keys.s ? 1 : 0);
    const turn = (keys.a ? 1 : 0) - (keys.d ? 1 : 0);

    speed += forward * 12 * dt;
    speed *= 0.985;
    speed = THREE.MathUtils.clamp(speed, -7, 17);

    currentCar.rotation.y += turn * dt * 1.6;

    const direction = new THREE.Vector3(
      Math.sin(currentCar.rotation.y),
      0,
      Math.cos(currentCar.rotation.y)
    );

    currentCar.position.addScaledVector(direction, speed * dt);
  } else {
    const forward = (keys.w ? 1 : 0) - (keys.s ? 1 : 0);
    const turn = (keys.a ? 1 : 0) - (keys.d ? 1 : 0);

    if (forward !== 0) {
      player.rotation.y += turn * dt * 2;

      const direction = new THREE.Vector3(
        Math.sin(player.rotation.y),
        0,
        Math.cos(player.rotation.y)
      );

      player.position.addScaledVector(
        direction,
        forward * (keys.shift ? 7 : 4) * dt
      );
    }
  }

  const target = driving && currentCar
    ? currentCar.position
    : player.position;

  const rotation = driving && currentCar
    ? currentCar.rotation.y
    : player.rotation.y;

  const cameraOffset = new THREE.Vector3(
    -Math.sin(rotation) * 8,
    5,
    -Math.cos(rotation) * 8
  );

  camera.position.lerp(
    target.clone().add(cameraOffset),
    0.12
  );

  camera.lookAt(target.x, target.y + 1.2, target.z);

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
