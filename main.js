import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import './style.css';

const scoreElement = document.querySelector('#score');
const timeElement = document.querySelector('#time');
const arrowsElement = document.querySelector('#arrows');
const intro = document.querySelector('#intro');
const startButton = document.querySelector('#start-button');
const crosshair = document.querySelector('#crosshair');
const messageElement = document.querySelector('#message');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9c5c7');
scene.fog = new THREE.Fog('#a9c5c7', 22, 75);

const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 1.65, 5);
camera.lookAt(0, 1.6, -8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer, { optionalFeatures: ['local-floor', 'bounded-floor'] }));

scene.add(new THREE.HemisphereLight('#e9f4f3', '#58685b', 2.2));
const sun = new THREE.DirectionalLight('#fff0d6', 3.2);
sun.position.set(-5, 10, 5);
scene.add(sun);

const materials = {
  ground: new THREE.MeshStandardMaterial({ color: '#728d78', roughness: 1 }),
  platform: new THREE.MeshStandardMaterial({ color: '#dbc7a6', roughness: .88 }),
  targetDark: new THREE.MeshStandardMaterial({ color: '#273741', roughness: .8 }),
  targetLight: new THREE.MeshStandardMaterial({ color: '#f1e7d2', roughness: .8 }),
  targetRed: new THREE.MeshStandardMaterial({ color: '#e27858', roughness: .8 }),
  targetGold: new THREE.MeshStandardMaterial({ color: '#efc567', roughness: .8 }),
  arrow: new THREE.MeshStandardMaterial({ color: '#f1d49a', metalness: .25, roughness: .4 }),
  feather: new THREE.MeshStandardMaterial({ color: '#e27858', roughness: .65 }),
  wood: new THREE.MeshStandardMaterial({ color: '#b67a50', roughness: .72 }),
  string: new THREE.MeshStandardMaterial({ color: '#f2e8d5', roughness: .9 }),
};

const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), materials.ground);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.02;
scene.add(ground);

const platform = new THREE.Mesh(new THREE.CylinderGeometry(11, 12, .5, 64), materials.platform);
platform.position.set(0, -.26, -5);
scene.add(platform);

function makeBuilding(x, y, z, width, height, depth, color) {
  const building = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color, roughness: .94 }),
  );
  building.position.set(x, y, z);
  scene.add(building);
  for (let row = 0; row < Math.floor(height / 1.35); row += 1) {
    for (let col = 0; col < Math.floor(width / 1.25); col += 1) {
      const windowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(.34, .48),
        new THREE.MeshBasicMaterial({ color: row % 3 === 0 ? '#f0d7a2' : '#718b8b' }),
      );
      windowMesh.position.set(
        x - width / 2 + .75 + col * 1.25,
        .9 + row * 1.35,
        z + depth / 2 + .012,
      );
      scene.add(windowMesh);
    }
  }
}

makeBuilding(-15, 5, -24, 8, 10, 5, '#8a9b91');
makeBuilding(-6, 8, -29, 9, 16, 6, '#758b87');
makeBuilding(5, 6, -27, 8, 12, 5, '#a08f7d');
makeBuilding(15, 9, -31, 10, 18, 6, '#728582');
makeBuilding(23, 5, -25, 8, 10, 5, '#a99d88');

const clouds = new THREE.Group();
scene.add(clouds);
for (let i = 0; i < 16; i += 1) {
  const puff = new THREE.Mesh(
    new THREE.SphereGeometry(1, 10, 8),
    new THREE.MeshBasicMaterial({ color: '#eaf2eb', transparent: true, opacity: .23 }),
  );
  puff.position.set((i % 4) * 13 - 20, 7 + Math.floor(i / 4) * 2.5, -18 - (i % 3) * 8);
  puff.scale.set(3.2, .65, 1.1);
  clouds.add(puff);
}

const targets = [];
const targetPositions = [
  new THREE.Vector3(-4.2, 1.65, -11),
  new THREE.Vector3(0, 1.65, -13),
  new THREE.Vector3(4.25, 1.65, -11),
];

function createTarget(position, phase) {
  const group = new THREE.Group();
  group.position.copy(position);
  const rings = [
    { radius: .9, material: materials.targetDark },
    { radius: .73, material: materials.targetLight },
    { radius: .53, material: materials.targetRed },
    { radius: .32, material: materials.targetLight },
    { radius: .14, material: materials.targetGold },
  ];
  for (const [index, { radius, material }] of rings.entries()) {
    const disc = new THREE.Mesh(new THREE.CircleGeometry(radius, 48), material);
    disc.position.z = .01 + index * .006;
    group.add(disc);
  }
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.055, .08, 1.25, 8), materials.wood);
  post.position.set(0, -.97, 0);
  group.add(post);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(.22, .28, .12, 12), materials.wood);
  foot.position.set(0, -1.58, 0);
  group.add(foot);
  scene.add(group);
  targets.push({ group, baseX: position.x, phase, radius: .9 });
}
targetPositions.forEach((position, index) => createTarget(position, index * 1.8));

const bowGeometry = new THREE.Group();
const bowCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(.05, -.52, 0),
  new THREE.Vector3(.35, -.36, 0),
  new THREE.Vector3(.42, 0, 0),
  new THREE.Vector3(.35, .36, 0),
  new THREE.Vector3(.05, .52, 0),
]);
const bow = new THREE.Mesh(new THREE.TubeGeometry(bowCurve, 24, .035, 8, false), materials.wood);
bowGeometry.add(bow);
const stringGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(.05, -.52, 0),
  new THREE.Vector3(.05, .52, 0),
]);
bowGeometry.add(new THREE.Line(stringGeometry, materials.string));
const bowGrip = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .2, 8), materials.arrow);
bowGrip.position.set(.03, 0, 0);
bowGeometry.add(bowGrip);
const leftController = renderer.xr.getController(0);
const rightController = renderer.xr.getController(1);
const leftGrip = renderer.xr.getControllerGrip(0);
leftGrip.add(bowGeometry);
scene.add(leftGrip, leftController, rightController);

const arrows = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const forward = new THREE.Vector3(0, 0, -1);
const elapsedClock = new THREE.Clock();
let score = 0;
let shots = 0;
let remaining = 60;
let gameActive = false;
let timerStartedAt = null;
let messageTimeout;

function updateStats() {
  scoreElement.textContent = String(score).padStart(4, '0');
  timeElement.textContent = String(Math.ceil(remaining)).padStart(2, '0');
  arrowsElement.textContent = String(shots).padStart(2, '0');
}

function showMessage(text) {
  messageElement.textContent = text;
  messageElement.classList.add('visible');
  window.clearTimeout(messageTimeout);
  messageTimeout = window.setTimeout(() => messageElement.classList.remove('visible'), 1100);
}

function makeArrow() {
  const arrowGroup = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .82, 8), materials.arrow);
  shaft.rotation.x = -Math.PI / 2;
  arrowGroup.add(shaft);

  const tip = new THREE.Mesh(new THREE.ConeGeometry(.055, .16, 8), materials.targetGold);
  tip.rotation.x = -Math.PI / 2;
  tip.position.z = -.48;
  arrowGroup.add(tip);

  for (const side of [-1, 1]) {
    const feather = new THREE.Mesh(new THREE.BoxGeometry(.012, .12, .17), materials.feather);
    feather.position.set(side * .035, 0, .3);
    arrowGroup.add(feather);
  }
  scene.add(arrowGroup);
  return arrowGroup;
}

function shoot(origin, direction) {
  if (!gameActive) return;
  if (timerStartedAt === null) timerStartedAt = elapsedClock.elapsedTime;
  const normalizedDirection = direction.clone().normalize();
  const arrow = makeArrow();
  arrow.position.copy(origin).addScaledVector(normalizedDirection, .45);
  arrow.quaternion.setFromUnitVectors(forward, normalizedDirection);
  arrows.push({ mesh: arrow, velocity: normalizedDirection.multiplyScalar(24), age: 0 });
  shots += 1;
  updateStats();
}

function shootFromController(controller) {
  if (!gameActive) return;
  controller.updateWorldMatrix(true, false);
  const origin = new THREE.Vector3().setFromMatrixPosition(controller.matrixWorld);
  const direction = forward.clone().applyQuaternion(controller.getWorldQuaternion(new THREE.Quaternion()));
  shoot(origin, direction);
}

for (const controller of [leftController, rightController]) {
  controller.addEventListener('selectstart', () => shootFromController(controller));
}

function endGame() {
  gameActive = false;
  remaining = 0;
  for (const arrow of arrows) {
    scene.remove(arrow.mesh);
    arrow.mesh.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
    });
  }
  arrows.length = 0;
  updateStats();
  intro.querySelector('.eyebrow').textContent = 'CHALLENGE COMPLETE';
  intro.querySelector('h1').innerHTML = `You scored<br /><span>${String(score).padStart(4, '0')}.</span>`;
  intro.querySelector('.intro-copy').textContent = 'Ready for another round? Your next perfect shot is waiting.';
  startButton.innerHTML = 'Play again <span aria-hidden="true">↗</span>';
  intro.classList.remove('hidden');
  showMessage('Time is up');
}

function startGame() {
  score = 0;
  shots = 0;
  remaining = 60;
  timerStartedAt = null;
  gameActive = true;
  intro.classList.add('hidden');
  crosshair.classList.add('visible');
  showMessage('Aim for the gold');
  updateStats();
}

startButton.addEventListener('click', startGame);

renderer.domElement.addEventListener('pointermove', (event) => {
  const bounds = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  crosshair.style.left = `${event.clientX}px`;
  crosshair.style.top = `${event.clientY}px`;
});

renderer.domElement.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || renderer.xr.isPresenting || !gameActive) return;
  camera.updateMatrixWorld();
  raycaster.setFromCamera(mouse, camera);
  const origin = camera.getWorldPosition(new THREE.Vector3());
  shoot(origin, raycaster.ray.direction);
});

function scoreForDistance(distance) {
  if (distance <= .14) return 1000;
  if (distance <= .32) return 500;
  if (distance <= .53) return 250;
  if (distance <= .73) return 100;
  if (distance <= .9) return 50;
  return 0;
}

function updateArrows(delta) {
  for (let index = arrows.length - 1; index >= 0; index -= 1) {
    const arrow = arrows[index];
    const previousPosition = arrow.mesh.position.clone();
    arrow.mesh.position.addScaledVector(arrow.velocity, delta);
    arrow.age += delta;
    let hit = false;

    for (const target of targets) {
      target.group.updateWorldMatrix(true, false);
      const center = target.group.position.clone();
      center.y += .02;
      const segment = arrow.mesh.position.clone().sub(previousPosition);
      const segmentLengthSquared = segment.lengthSq();
      const closestT = segmentLengthSquared === 0
        ? 0
        : THREE.MathUtils.clamp(center.clone().sub(previousPosition).dot(segment) / segmentLengthSquared, 0, 1);
      const closestPoint = previousPosition.clone().addScaledVector(segment, closestT);
      const localHit = target.group.worldToLocal(closestPoint.clone());
      const distance = Math.hypot(localHit.x, localHit.y);
      if (Math.abs(localHit.z) <= .34 && distance <= target.radius) {
        const points = scoreForDistance(distance);
        if (points > 0) {
          score += points;
          updateStats();
          showMessage(points === 1000 ? 'Bullseye  +1000' : `Nice shot  +${points}`);
        }
        hit = true;
        break;
      }
    }

    if (hit || arrow.age > 4 || arrow.mesh.position.y < -2) {
      scene.remove(arrow.mesh);
      arrow.mesh.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
      });
      arrows.splice(index, 1);
    }
  }
}

function animate() {
  const delta = Math.min(elapsedClock.getDelta(), .05);
  const now = elapsedClock.elapsedTime;
  for (const target of targets) {
    target.group.position.x = target.baseX + Math.sin(now * .65 + target.phase) * .68;
  }
  clouds.position.x = Math.sin(now * .035) * .6;
  if (gameActive && timerStartedAt !== null) {
    remaining = Math.max(0, 60 - (now - timerStartedAt));
    updateStats();
    if (remaining === 0) endGame();
  }
  updateArrows(delta);
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

updateStats();
renderer.setAnimationLoop(animate);
