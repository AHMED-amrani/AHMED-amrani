const featured = [
  {
    title: "Ethiopia Yirgacheffe",
    desc: "Floral, citrus, delicate body",
    img: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Colombia Supremo",
    desc: "Chocolate, caramel, balanced",
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Kenya AA",
    desc: "Blackcurrant, bright acidity",
    img: "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Guatemala Antigua",
    desc: "Cocoa, spice, smooth finish",
    img: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Brazil Santos",
    desc: "Nutty, low acidity, sweet",
    img: "https://images.unsplash.com/photo-1494314671902-399b18174975?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Sumatra Mandheling",
    desc: "Earthy, syrupy, herbal",
    img: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=1200&auto=format&fit=crop"
  }
];

const products = [
  {
    title: "Ethiopia Yirgacheffe",
    price: "$18",
    img: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Colombia Supremo",
    price: "$17",
    img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Kenya AA",
    price: "$19",
    img: "https://images.unsplash.com/photo-1436491911682-72ab1d398f59?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Guatemala Antigua",
    price: "$18",
    img: "https://images.unsplash.com/photo-1459755486867-b55449bb39ff?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Brazil Santos",
    price: "$16",
    img: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Sumatra Mandheling",
    price: "$20",
    img: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=1200&auto=format&fit=crop"
  }
];

const ring = document.getElementById('carousel-ring');
const grid = document.getElementById('product-grid');
const year = document.getElementById('year');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const toggleRotateBtn = document.getElementById('toggle-rotate');

// Build carousel cards
const cardCount = featured.length;
const theta = 360 / cardCount;
const radius = 380; // distance from center

featured.forEach((item, i) => {
  const card = document.createElement('article');
  card.className = 'carousel-card';
  card.innerHTML = `
    <img src="${item.img}" alt="${item.title}">
    <div class="meta">
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
    </div>
  `;
  const angle = i * theta;
  card.style.transform = `translateZ(${radius}px) rotateY(${angle}deg)`;
  ring.appendChild(card);
});

let currentIndex = 0;
let autoRotate = true;
let rafId = null;

function updateRotation() {
  const angle = currentIndex * -theta;
  ring.style.transform = `translateZ(-${radius - 20}px) rotateY(${angle}deg)`;
}

function next() { currentIndex = (currentIndex + 1) % cardCount; updateRotation(); }
function prev() { currentIndex = (currentIndex - 1 + cardCount) % cardCount; updateRotation(); }

nextBtn.addEventListener('click', next);
prevBtn.addEventListener('click', prev);

toggleRotateBtn.addEventListener('click', () => {
  autoRotate = !autoRotate;
  toggleRotateBtn.textContent = autoRotate ? 'Pause Rotation' : 'Resume Rotation';
});

function tick() {
  if (autoRotate) {
    currentIndex = (currentIndex + 0.005) % cardCount; // smooth fractional step
    updateRotation();
  }
  rafId = requestAnimationFrame(tick);
}

// Build product grid
products.forEach(p => {
  const el = document.createElement('article');
  el.className = 'product-card';
  el.innerHTML = `
    <img src="${p.img}" alt="${p.title}">
    <div class="info">
      <div>
        <h3 style="margin:0 0 6px">${p.title}</h3>
        <div class="price-row">
          <span>${p.price}</span>
          <button class="add-btn">Add</button>
        </div>
      </div>
    </div>
  `;
  grid.appendChild(el);
});

year.textContent = new Date().getFullYear();

// Kick off animation
updateRotation();
rafId = requestAnimationFrame(tick);

// Cleanup on page hide
window.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(rafId);
  else rafId = requestAnimationFrame(tick);
});
