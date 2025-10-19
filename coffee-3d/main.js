import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const root = document.getElementById('three-root');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(root.clientWidth, root.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
root.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, root.clientWidth / root.clientHeight, 0.1, 100);
camera.position.set(0.8, 0.9, 2.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 1.2;
controls.maxDistance = 3.2;
controls.minPolarAngle = Math.PI * 0.2;
controls.maxPolarAngle = Math.PI * 0.5;

// Lighting: warm key + cool fill + subtle rim
const hemi = new THREE.HemisphereLight(0xffe0c2, 0x222222, 0.6);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffcc99, 1.0);
key.position.set(2.5, 3, 2);
key.castShadow = false;
scene.add(key);
const rim = new THREE.DirectionalLight(0x88aaff, 0.35);
rim.position.set(-2.5, 1.2, -2);
scene.add(rim);

// Ground shadow
const groundGeometry = new THREE.CircleGeometry(2.8, 64);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.9, metalness: 0.0 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.6;
scene.add(ground);

// Stylized coffee cup: 
// - Body: lathe from a profile curve 
// - Lip: torus 
// - Handle: torus section 
// - Saucer: lathe
function createCup() {
  // Body profile (radius over height)
  const points = [];
  const height = 0.9;
  const radiusTop = 0.42;
  const radiusBottom = 0.28;
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const r = radiusBottom + (radiusTop - radiusBottom) * Math.pow(t, 1.2);
    points.push(new THREE.Vector2(r, t * height));
  }
  const bodyGeo = new THREE.LatheGeometry(points, 80);
  const porcelain = new THREE.MeshPhysicalMaterial({
    color: 0xeee7e0,
    roughness: 0.35,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.15,
    sheen: 0.2
  });
  const body = new THREE.Mesh(bodyGeo, porcelain);
  body.castShadow = false; body.receiveShadow = false;

  // Lip
  const lipGeo = new THREE.TorusGeometry(radiusTop * 0.98, 0.015, 24, 80);
  const lip = new THREE.Mesh(lipGeo, porcelain);
  lip.position.y = height + 0.005;
  lip.rotation.x = Math.PI / 2;

  // Handle: torus section
  const handleGeo = new THREE.TorusGeometry(0.23, 0.035, 24, 100, Math.PI * 1.15);
  const handle = new THREE.Mesh(handleGeo, porcelain);
  handle.position.set(radiusTop * 0.9, height * 0.52, 0);
  handle.rotation.set(Math.PI / 2, 0, Math.PI * 0.08);

  // Coffee liquid
  const coffeeGeo = new THREE.CylinderGeometry(radiusTop * 0.96, radiusTop * 0.96, 0.18, 80, 1);
  const coffeeMat = new THREE.MeshPhysicalMaterial({ color: 0x4a2f22, roughness: 0.5, metalness: 0.0, transmission: 0.0 });
  const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
  coffee.position.y = height - 0.09;

  const cup = new THREE.Group();
  cup.add(body, lip, handle, coffee);

  // Saucer
  const saucerPoints = [];
  const saucerHeight = 0.08;
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const r = 0.55 + 0.25 * Math.sin(t * Math.PI);
    saucerPoints.push(new THREE.Vector2(r, t * saucerHeight));
  }
  const saucerGeo = new THREE.LatheGeometry(saucerPoints, 80);
  const saucer = new THREE.Mesh(saucerGeo, porcelain);
  saucer.position.y = -0.46;
  cup.add(saucer);

  return cup;
}

const cup = createCup();
scene.add(cup);

// Coffee beans (small spheres) scattered
function createBean() {
  const bean = new THREE.Group();
  const beanMat = new THREE.MeshStandardMaterial({ color: 0x5b3a29, roughness: 0.7, metalness: 0.05 });
  const geo1 = new THREE.SphereGeometry(0.06, 24, 16);
  const half1 = new THREE.Mesh(geo1, beanMat);
  half1.scale.set(1.25, 0.9, 1.0);
  const half2 = new THREE.Mesh(geo1, beanMat);
  half2.scale.set(1.25, 0.9, 1.0);
  half2.position.x = 0.02;
  // groove
  const grooveGeo = new THREE.TorusGeometry(0.04, 0.005, 8, 24);
  const groove = new THREE.Mesh(grooveGeo, new THREE.MeshStandardMaterial({ color: 0x3c2418, roughness: 0.8 }));
  groove.rotation.x = Math.PI / 2;
  groove.scale.set(1.4, 1, 1);

  bean.add(half1, half2, groove);
  return bean;
}

for (let i = 0; i < 16; i++) {
  const bean = createBean();
  bean.position.set((Math.random() - 0.5) * 1.6, -0.52 + Math.random() * 0.01, (Math.random() - 0.5) * 1.6);
  bean.rotation.y = Math.random() * Math.PI;
  scene.add(bean);
}

// Resize handling
function onResize() {
  const w = root.clientWidth;
  const h = root.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);

// Subtle float animation + scroll parallax
let t = 0;
let scrollY = 0;
window.addEventListener('scroll', () => { scrollY = window.scrollY || 0; });

function animate() {
  requestAnimationFrame(animate);
  t += 0.01;
  const float = Math.sin(t) * 0.02;
  cup.position.y = float;
  cup.rotation.y += 0.002;

  // Parallax: move camera slightly with scroll
  const targetZ = 2.2 + Math.min(1.0, scrollY / 1500) * 0.6;
  camera.position.z += (targetZ - camera.position.z) * 0.05;

  controls.update();
  renderer.render(scene, camera);
}

function init() {
  const rect = root.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  document.getElementById('year').textContent = String(new Date().getFullYear());
  animate();
}

init();
