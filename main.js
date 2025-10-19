// 3D Scene and UI interactions for Caffè Studio

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function clampDevicePixelRatio(value) {
  return Math.min(2, Math.max(1, value));
}

function createCoffeeCupGroup() {
  const group = new THREE.Group();

  // Materials
  const porcelainMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.35,
    metalness: 0.0,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    sheen: 0.3,
  });
  const coffeeMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color('#4a2d16'), roughness: 0.2, metalness: 0.0 });
  const saucerMaterial = new THREE.MeshPhysicalMaterial({ color: 0xf4f4f4, roughness: 0.5, clearcoat: 0.5 });
  const beanMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color('#5a3a1e'), roughness: 0.5, metalness: 0.0 });

  // Cup body (hollow)
  const cupOuter = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.15, 1.6, 64, 1, true), porcelainMaterial);
  cupOuter.castShadow = true;
  const cupInner = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 1.52, 64, 1, true), porcelainMaterial);
  cupInner.scale.set(1, 1, 1);
  cupInner.castShadow = false;
  cupInner.receiveShadow = false;
  cupInner.material.side = THREE.BackSide;

  // Rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.04, 24, 64), porcelainMaterial);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.81;
  rim.castShadow = true;

  // Coffee surface
  const coffeeSurface = new THREE.Mesh(new THREE.CircleGeometry(0.88, 48), coffeeMaterial);
  coffeeSurface.rotation.x = -Math.PI / 2;
  coffeeSurface.position.y = 0.79;

  // Handle
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.11, 24, 64), porcelainMaterial);
  handle.position.set(1.25, 0.25, 0);
  handle.rotation.z = Math.PI / 2.2;
  handle.castShadow = true;

  // Saucer
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.12, 64), saucerMaterial);
  saucer.position.y = -0.9;
  saucer.receiveShadow = true;

  // Coffee beans (simple elongated spheres)
  const beanGeometry = new THREE.SphereGeometry(0.16, 16, 12);
  const beansGroup = new THREE.Group();
  for (let i = 0; i < 18; i++) {
    const bean = new THREE.Mesh(beanGeometry, beanMaterial);
    const angle = (i / 18) * Math.PI * 2;
    const radius = 2.8 + (i % 3) * 0.15;
    bean.scale.set(1.0, 0.7, 1.4);
    bean.position.set(Math.cos(angle) * radius, -0.85 + (Math.random() * 0.12 - 0.06), Math.sin(angle) * radius);
    bean.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    bean.castShadow = true;
    beansGroup.add(bean);
  }

  group.add(saucer, cupOuter, cupInner, rim, coffeeSurface, handle, beansGroup);
  group.rotation.y = Math.PI * 0.15;

  return group;
}

function createThreeScene(containerElement) {
  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(clampDevicePixelRatio(window.devicePixelRatio || 1));
  renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  containerElement.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(50, containerElement.clientWidth / containerElement.clientHeight, 0.1, 100);
  camera.position.set(3.6, 2.2, 4.2);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 3.2;
  controls.maxDistance = 7.5;
  controls.minPolarAngle = Math.PI * 0.25;
  controls.maxPolarAngle = Math.PI * 0.5;
  controls.autoRotate = !prefersReducedMotion;
  controls.autoRotateSpeed = 0.7;

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(4, 6, 3);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  scene.add(keyLight);

  const fillLight = new THREE.SpotLight(0xffe1c6, 0.6, 12, Math.PI / 5, 0.3, 1.5);
  fillLight.position.set(-3.2, 4.5, 2.2);
  fillLight.castShadow = false;
  scene.add(fillLight);

  // Ground (soft shadow look)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshStandardMaterial({ color: 0x0e0d0c, roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.95;
  ground.receiveShadow = true;
  scene.add(ground);

  const cupGroup = createCoffeeCupGroup();
  scene.add(cupGroup);

  // Animation
  const clock = new THREE.Clock();

  function onResize() {
    const { clientWidth, clientHeight } = containerElement;
    renderer.setPixelRatio(clampDevicePixelRatio(window.devicePixelRatio || 1));
    renderer.setSize(clientWidth, clientHeight);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  function render() {
    const elapsed = clock.getElapsedTime();
    cupGroup.rotation.y += 0.0025;
    cupGroup.position.y = Math.sin(elapsed * 0.8) * 0.03;

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  return { scene, camera, renderer, controls };
}

function setupCarouselAndLightbox() {
  const track = document.querySelector('.carousel-track');
  const prev = document.querySelector('.carousel-btn.prev');
  const next = document.querySelector('.carousel-btn.next');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');

  function scrollByAmount(dir) {
    const amount = track.clientWidth * 0.9 * dir;
    track.scrollBy({ left: amount, behavior: 'smooth' });
  }

  prev.addEventListener('click', () => scrollByAmount(-1));
  next.addEventListener('click', () => scrollByAmount(1));

  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') scrollByAmount(-1);
    if (e.key === 'ArrowRight') scrollByAmount(1);
  });

  track.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLImageElement)) return;
    const largeSrc = target.getAttribute('data-large') || target.src;
    lightboxImg.src = largeSrc;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });

  function closeLightbox() {
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') closeLightbox();
  });
}

function setFooterYear() {
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }
}

function mount() {
  const sceneContainer = document.getElementById('scene-container');
  if (!sceneContainer) return;

  try {
    createThreeScene(sceneContainer);
  } catch (err) {
    console.error('Failed to initialize WebGL scene', err);
    sceneContainer.innerHTML = '<div class="no-js-fallback">Your browser may not support WebGL.</div>';
  }

  setupCarouselAndLightbox();
  setFooterYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
