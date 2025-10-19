import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('hero-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0b0b0b, 8, 32);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0.8, 1.2, 2.8);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xfff2e0, 1.2);
keyLight.position.set(3, 4, 2);
keyLight.castShadow = true;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
rimLight.position.set(-3, 2, -2);
scene.add(rimLight);

// Ground
const groundGeo = new THREE.CircleGeometry(3.6, 64);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.9, metalness: 0.0 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
ground.receiveShadow = true;
scene.add(ground);

// Coffee cup (simple procedural model)
const cup = new THREE.Group();
scene.add(cup);

// Cup outer wall
const outerGeo = new THREE.CylinderGeometry(0.8, 0.9, 1.1, 48, 1, true);
outerGeo.translate(0, 0.55, 0);
const outerMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.0, clearcoat: 0.3, clearcoatRoughness: 0.2 });
const outerMesh = new THREE.Mesh(outerGeo, outerMat);
outerMesh.castShadow = true;
cup.add(outerMesh);

// Cup rim (slight bevel)
const rimGeo = new THREE.TorusGeometry(0.85, 0.04, 16, 64);
rimGeo.rotateX(Math.PI / 2);
rimGeo.translate(0, 1.1, 0);
const rimMat = new THREE.MeshPhysicalMaterial({ color: 0xf5f5f5, roughness: 0.25, metalness: 0.0 });
const rimMesh = new THREE.Mesh(rimGeo, rimMat);
rimMesh.castShadow = true;
cup.add(rimMesh);

// Cup bottom disk (close the bottom)
const bottomGeo = new THREE.CircleGeometry(0.75, 48);
bottomGeo.rotateX(-Math.PI / 2);
bottomGeo.translate(0, 0.0, 0);
const bottom = new THREE.Mesh(bottomGeo, rimMat);
bottom.receiveShadow = true;
cup.add(bottom);

// Coffee liquid
const liquidGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.02, 48);
liquidGeo.translate(0, 1.01, 0);
const liquidMat = new THREE.MeshPhysicalMaterial({ color: 0x4b2e2b, roughness: 0.15, metalness: 0.0, transmission: 0.0, ior: 1.33 });
const liquid = new THREE.Mesh(liquidGeo, liquidMat);
liquid.castShadow = false;
liquid.receiveShadow = true;
cup.add(liquid);

// Handle
const handleCurve = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(0.8, 0.85, 0.0),
  new THREE.Vector3(1.25, 0.7, 0.0),
  new THREE.Vector3(0.9, 0.45, 0.0)
);
const handlePath = new THREE.CurvePath();
handlePath.add(handleCurve);
const handleTubeGeo = new THREE.TubeGeometry(handlePath, 20, 0.07, 16, false);
const handle = new THREE.Mesh(handleTubeGeo, outerMat);
handle.castShadow = true;
handle.receiveShadow = true;
cup.add(handle);

// Saucer
const saucerGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.06, 64);
saucerGeo.translate(0, 0.03, 0);
const saucerMat = new THREE.MeshStandardMaterial({ color: 0xf1f1f1, roughness: 0.5, metalness: 0.0 });
const saucer = new THREE.Mesh(saucerGeo, saucerMat);
saucer.receiveShadow = true;
scene.add(saucer);

// Coffee beans (a few scattered ellipsoids)
const beanMat = new THREE.MeshStandardMaterial({ color: 0x3a231e, roughness: 0.6, metalness: 0.05 });
const beanGeo = new THREE.SphereGeometry(0.08, 16, 12);
beanGeo.scale(1.4, 1.0, 0.9);
for (let i = 0; i < 12; i++) {
  const bean = new THREE.Mesh(beanGeo, beanMat);
  const r = 1.3 + Math.random() * 0.2;
  const a = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
  bean.position.set(Math.cos(a) * r, 0.06, Math.sin(a) * r);
  bean.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.4);
  bean.castShadow = true;
  scene.add(bean);
}

// Soft steam particles using Points
const steamGroup = new THREE.Group();
scene.add(steamGroup);
const steamGeom = new THREE.BufferGeometry();
const STEAM_COUNT = 80;
const positions = new Float32Array(STEAM_COUNT * 3);
for (let i = 0; i < STEAM_COUNT; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 0.4;
  positions[i * 3 + 1] = 1.02 + Math.random() * 0.4;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
}
steamGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const steamMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.6, depthWrite: false });
const steam = new THREE.Points(steamGeom, steamMat);
steamGroup.add(steam);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.6, 0);
controls.maxPolarAngle = Math.PI * 0.55;
controls.minDistance = 2;
controls.maxDistance = 4;

// Resize handling
function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
window.addEventListener('resize', onResize);

// Animation loop
const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();

  // Gentle steam drift upward
  const pos = steamGeom.getAttribute('position');
  for (let i = 0; i < STEAM_COUNT; i++) {
    const yIndex = i * 3 + 1;
    const baseY = 1.02;
    const speed = 0.15 + (i % 5) * 0.02;
    let y = pos.array[yIndex] + speed * 0.01;
    if (y > 1.7) y = baseY + Math.random() * 0.1;
    pos.array[yIndex] = y;
  }
  pos.needsUpdate = true;

  // Subtle cup bob
  cup.position.y = Math.sin(t * 0.8) * 0.01;
  cup.rotation.y = Math.sin(t * 0.2) * 0.05;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Accessibility tweaks and UI helpers
function initUI() {
  // Year in footer
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear().toString();

  // Menu toggle
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      links.classList.toggle('open');
    });
  }

  // Smooth scroll buttons
  document.querySelectorAll('[data-scroll], .nav__links a, .backtotop, .btn[href^="#"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const targetSel = el.getAttribute('data-scroll') || el.getAttribute('href');
      if (!targetSel || !targetSel.startsWith('#')) return;
      const target = document.querySelector(targetSel);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Reveal on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.2 }
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
}

initUI();
animate();
