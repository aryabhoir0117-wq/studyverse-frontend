/* =====================================================
   StudyVerse — main.js
   All interactive behaviour, animations, and canvas
   ===================================================== */

/* ─── 1. CUSTOM CURSOR ─────────────────────────────── */
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top  = mouseY + 'px';
});

(function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
})();

document.querySelectorAll('a, button, .swatch, .sym-btn, .island-card, .ship-svg *, .bottle').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});


/* ─── 2. OCEAN CANVAS ──────────────────────────────── */
const canvas = document.getElementById('ocean-canvas');
const ctx    = canvas.getContext('2d');

let W, H;
const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
resize();
window.addEventListener('resize', resize);

// Wave layers
const waves = [
  { y: 0.72, amp: 28, freq: 0.012, speed: 0.016, color: 'rgba(14,116,144,0.18)' },
  { y: 0.76, amp: 20, freq: 0.018, speed: 0.022, color: 'rgba(10,90,120,0.14)' },
  { y: 0.80, amp: 14, freq: 0.024, speed: 0.030, color: 'rgba(8,70,100,0.10)' },
  { y: 0.84, amp: 10, freq: 0.032, speed: 0.040, color: 'rgba(5,50,80,0.08)' },
];

// Bioluminescent particles
const particles = Array.from({ length: 90 }, () => ({
  x: Math.random() * 2000,
  y: Math.random() * 800 + 400,
  r: Math.random() * 2.5 + 0.5,
  vx: (Math.random() - 0.5) * 0.4,
  vy: -Math.random() * 0.3 - 0.1,
  life: Math.random(),
  speed: Math.random() * 0.004 + 0.002,
  hue: Math.random() * 30 + 170,  // teal range
}));

// Ripples from mouse
const ripples = [];
let lastRipple = 0;

document.addEventListener('mousemove', e => {
  const now = Date.now();
  if (now - lastRipple > 80) {
    ripples.push({ x: e.clientX, y: e.clientY, r: 0, maxR: 60, alpha: 0.4 });
    lastRipple = now;
    if (ripples.length > 18) ripples.shift();
  }
});

let tick = 0;

function drawOcean() {
  ctx.clearRect(0, 0, W, H);

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.75);
  sky.addColorStop(0,    '#020810');
  sky.addColorStop(0.4,  '#05101e');
  sky.addColorStop(0.7,  '#091828');
  sky.addColorStop(1,    '#0d2030');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Distant islands silhouette
  ctx.fillStyle = 'rgba(5,12,22,0.85)';
  drawIslandSilhouette(ctx, W * 0.08, H * 0.68, 120, 55);
  drawIslandSilhouette(ctx, W * 0.82, H * 0.65, 90, 45);
  drawIslandSilhouette(ctx, W * 0.55, H * 0.70, 60, 30);

  // Stars
  ctx.save();
  for (let i = 0; i < 160; i++) {
    const sx = ((i * 137.5) % W);
    const sy = ((i * 97.3) % (H * 0.6));
    const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(tick * 0.015 + i));
    ctx.globalAlpha = twinkle * 0.7;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, sy, 0.7 + (i % 3) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Moon
  const moonX = W * 0.82;
  const moonY = H * 0.12;
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 70);
  moonGlow.addColorStop(0,   'rgba(255,230,160,0.15)');
  moonGlow.addColorStop(1,   'transparent');
  ctx.fillStyle = moonGlow;
  ctx.beginPath(); ctx.arc(moonX, moonY, 70, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
  ctx.fillStyle = '#f5e6b0'; ctx.fill();
  // Moon reflection on water
  const refGrad = ctx.createLinearGradient(moonX - 30, H * 0.72, moonX + 30, H);
  refGrad.addColorStop(0, 'rgba(245,230,176,0.25)');
  refGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = refGrad;
  ctx.fillRect(moonX - 25, H * 0.72, 50, H * 0.28);

  // Waves
  waves.forEach(w => {
    ctx.beginPath();
    ctx.moveTo(0, H * w.y);
    for (let x = 0; x <= W; x += 6) {
      const yOff = Math.sin(x * w.freq + tick * w.speed) * w.amp
                 + Math.sin(x * w.freq * 1.7 + tick * w.speed * 0.6) * w.amp * 0.4;
      ctx.lineTo(x, H * w.y + yOff);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = w.color;
    ctx.fill();
  });

  // Bioluminescent particles
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life += p.speed;
    if (p.life > 1) { p.life = 0; p.y = H * 0.75 + Math.random() * H * 0.25; p.x = Math.random() * W; }
    const alpha = Math.sin(p.life * Math.PI) * 0.7;
    ctx.beginPath();
    ctx.arc(p.x % W, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue},100%,70%,${alpha})`;
    ctx.shadowColor = `hsla(${p.hue},100%,70%,0.8)`;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    const rip = ripples[i];
    rip.r += 2.2;
    rip.alpha *= 0.92;
    if (rip.alpha < 0.01 || rip.r > rip.maxR) { ripples.splice(i, 1); continue; }
    ctx.beginPath();
    ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(34,211,238,${rip.alpha})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  tick++;
  requestAnimationFrame(drawOcean);
}

function drawIslandSilhouette(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + w * 0.2, y - h * 0.6, x + w * 0.4, y - h, x + w * 0.5, y - h * 0.9);
  ctx.bezierCurveTo(x + w * 0.65, y - h * 0.7, x + w * 0.8, y - h * 0.3, x + w, y);
  ctx.closePath();
  ctx.fill();
}

drawOcean();


/* ─── 3. HEADER SCROLL ─────────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('site-header').classList.toggle('scrolled', window.scrollY > 50);
});


/* ─── 4. SHIP PARALLAX ─────────────────────────────── */
const shipWrap = document.getElementById('ship-wrap');
const shipScene = document.getElementById('ship-scene');

document.addEventListener('mousemove', e => {
  if (!shipScene) return;
  const rect = shipScene.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (e.clientX - cx) / (window.innerWidth / 2);
  const dy = (e.clientY - cy) / (window.innerHeight / 2);
  // Subtle tilt — ship stays readable
  shipWrap.style.transform = `rotateY(${dx * 6}deg) rotateX(${-dy * 3}deg) translateY(0)`;
});


/* ─── 5. SHIP CLICK INTERACTIONS ───────────────────── */
const tipMast  = document.getElementById('tip-mast');
const tipCabin = document.getElementById('tip-cabin');
const tipChest = document.getElementById('tip-chest');

function showTip(el) { el.style.opacity = '1'; }
function hideTip(el) { el.style.opacity = '0'; }

// Mast → Start Learning
['mast-btn', 'mast-btn2'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('mouseenter', () => showTip(tipMast));
  el.addEventListener('mouseleave', () => hideTip(tipMast));
  el.addEventListener('click', () => { window.location.href = 'pages/login.html'; });
});
document.getElementById('main-sail')?.addEventListener('mouseenter', () => showTip(tipMast));
document.getElementById('main-sail')?.addEventListener('mouseleave', () => hideTip(tipMast));
document.getElementById('main-sail')?.addEventListener('click', () => { window.location.href = 'pages/login.html'; });

// Cabin → Teacher Dashboard
const cabin = document.getElementById('cabin-btn');
if (cabin) {
  cabin.addEventListener('mouseenter', () => showTip(tipCabin));
  cabin.addEventListener('mouseleave', () => hideTip(tipCabin));
  cabin.addEventListener('click', () => { window.location.href = 'pages/login.html'; });
}

// Chest → reward popup
const chest = document.getElementById('chest-btn');
if (chest) {
  chest.addEventListener('mouseenter', () => showTip(tipChest));
  chest.addEventListener('mouseleave', () => hideTip(tipChest));
  chest.addEventListener('click', openRandomReward);
}


/* ─── 6. REWARD POPUP ──────────────────────────────── */
const rewards = [
  { icon: '🪙', text: '+50 XP! You found the treasure chest!' },
  { icon: '🗡️',  text: 'Rare Sword Unlocked! "The Learner\'s Blade"' },
  { icon: '📜', text: 'You discovered an Ancient Scroll of Knowledge!' },
  { icon: '🏅', text: '+1 Badge! "Curious Explorer"' },
  { icon: '🔱', text: 'Legendary Title Unlocked: "Seeker of Truth"' },
  { icon: '💎', text: '+100 XP! A rare gem from the deep!' },
];

function openRandomReward() {
  const r = rewards[Math.floor(Math.random() * rewards.length)];
  document.getElementById('reward-icon').textContent = r.icon;
  document.getElementById('reward-text').textContent = r.text;
  document.getElementById('reward-popup').classList.add('active');
}

window.closeReward = function() {
  document.getElementById('reward-popup').classList.remove('active');
};

document.getElementById('reward-popup').addEventListener('click', e => {
  if (e.target === document.getElementById('reward-popup')) closeReward();
});


/* ─── 7. FLOATING LANTERNS ─────────────────────────── */
const lanternWrap = document.getElementById('lanterns');
const lanternEmojis = ['🏮', '🪔', '🕯️'];

for (let i = 0; i < 10; i++) {
  const l = document.createElement('div');
  l.className = 'lantern';
  l.textContent = lanternEmojis[i % lanternEmojis.length];
  l.style.left = (5 + Math.random() * 90) + '%';
  l.style.top  = (10 + Math.random() * 55) + '%';
  l.style.animationDuration = (4 + Math.random() * 4) + 's';
  l.style.animationDelay    = (Math.random() * 3) + 's';
  l.style.fontSize = (1.2 + Math.random() * 1.2) + 'rem';
  lanternWrap.appendChild(l);
}


/* ─── 8. MESSAGE BOTTLES ───────────────────────────── */
const bottleWrap = document.getElementById('bottles');
const tips = [
  '💡 Tip: Complete daily quests to double XP!',
  '⚓ Did you know? Top pirates earn exclusive titles!',
  '🗺️ Explore all islands to unlock the Grand Route!',
  '☠️ Challenge a rival crew to a Quiz Battle!',
  '🏅 Your first badge is one quest away!',
];

tips.forEach((tip, i) => {
  const b = document.createElement('div');
  b.className = 'bottle';
  b.textContent = '🍾';
  b.style.left = (10 + i * 18 + Math.random() * 6) + '%';
  b.style.bottom = (8 + Math.random() * 8) + '%';
  b.style.animationDuration = (5 + Math.random() * 3) + 's';
  b.style.animationDelay    = (Math.random() * 2) + 's';
  b.title = tip;  // fallback

  const tt = document.createElement('div');
  tt.className = 'bottle-tip';
  tt.textContent = tip;
  b.appendChild(tt);

  bottleWrap.appendChild(b);
});


/* ─── 9. ISLAND CARDS SCROLL REVEAL ────────────────── */
const cards = document.querySelectorAll('.island-card');
cards.forEach(card => {
  const delay = (card.dataset.delay || 0) + 'ms';
  card.style.setProperty('--card-delay', delay);
});

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

cards.forEach(c => revealObs.observe(c));


/* ─── 10. STAT COUNTER ANIMATION ───────────────────── */
const statNums = document.querySelectorAll('.stat-num');

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el     = e.target;
    const target = parseInt(el.dataset.target);
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
    counterObs.unobserve(el);
  });
}, { threshold: 0.4 });

statNums.forEach(el => counterObs.observe(el));


/* ─── 11. FLAG BUILDER ─────────────────────────────── */
const flagCanvas = document.getElementById('flag-canvas');
const fctx       = flagCanvas.getContext('2d');

let flagBg     = '#1a0a2e';
let flagSymbol = 'skull';
let flagSymCol = '#ffffff';
let flagCrew   = '';

const symbolMap = {
  skull:  '☠',
  star:   '⭐',
  anchor: '⚓',
  sword:  '⚔️',
  crown:  '👑',
  fire:   '🔥',
};

function renderFlag() {
  const fw = flagCanvas.width;
  const fh = flagCanvas.height;

  // Background
  fctx.fillStyle = flagBg;
  fctx.fillRect(0, 0, fw, fh);

  // Decorative border
  fctx.strokeStyle = 'rgba(255,215,0,0.5)';
  fctx.lineWidth = 4;
  fctx.strokeRect(4, 4, fw - 8, fh - 8);
  fctx.strokeStyle = 'rgba(255,215,0,0.2)';
  fctx.lineWidth = 1;
  fctx.strokeRect(10, 10, fw - 20, fh - 20);

  // Symbol
  fctx.font = '72px serif';
  fctx.fillStyle = flagSymCol;
  fctx.textAlign = 'center';
  fctx.textBaseline = 'middle';
  fctx.shadowColor = flagSymCol;
  fctx.shadowBlur = 16;
  fctx.fillText(symbolMap[flagSymbol], fw / 2, fh * 0.42);
  fctx.shadowBlur = 0;

  // Crew name
  if (flagCrew.trim()) {
    fctx.font = 'bold 16px "Pirata One", serif';
    fctx.fillStyle = flagSymCol;
    fctx.shadowColor = flagSymCol;
    fctx.shadowBlur = 8;
    fctx.fillText(flagCrew.toUpperCase(), fw / 2, fh * 0.82);
    fctx.shadowBlur = 0;
  }
}

renderFlag();

// BG swatches
document.querySelectorAll('#bg-swatches .swatch').forEach(sw => {
  sw.addEventListener('click', () => {
    document.querySelectorAll('#bg-swatches .swatch').forEach(s => s.classList.remove('active'));
    sw.classList.add('active');
    flagBg = sw.dataset.color;
    renderFlag();
  });
});

// Symbol swatches
document.querySelectorAll('#sym-swatches .swatch').forEach(sw => {
  sw.addEventListener('click', () => {
    document.querySelectorAll('#sym-swatches .swatch').forEach(s => s.classList.remove('active'));
    sw.classList.add('active');
    flagSymCol = sw.dataset.color;
    renderFlag();
  });
});

// Symbol choices
document.querySelectorAll('.sym-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sym-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    flagSymbol = btn.dataset.sym;
    renderFlag();
  });
});

// Crew name input
document.getElementById('crew-name-input').addEventListener('input', e => {
  flagCrew = e.target.value;
  renderFlag();
});

// Download flag
document.getElementById('download-flag').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'my-pirate-flag.png';
  link.href = flagCanvas.toDataURL('image/png');
  link.click();
});


/* ─── 12. SAIL SWELL ON HOVER ──────────────────────── */
const mainSail = document.getElementById('main-sail');
const foreSail = document.getElementById('fore-sail');

if (mainSail) {
  mainSail.addEventListener('mouseenter', () => {
    mainSail.style.filter = 'drop-shadow(0 0 12px rgba(255,255,220,0.6))';
  });
  mainSail.addEventListener('mouseleave', () => {
    mainSail.style.filter = '';
  });
}
if (foreSail) {
  foreSail.addEventListener('mouseenter', () => {
    foreSail.style.filter = 'drop-shadow(0 0 8px rgba(255,255,220,0.4))';
  });
  foreSail.addEventListener('mouseleave', () => {
    foreSail.style.filter = '';
  });
}


/* ─── 13. GENERAL SCROLL FADE-IN ───────────────────── */
document.querySelectorAll('.fade-in').forEach(el => revealObs.observe(el));


/* ─── 14. KEYBOARD ESCAPE CLOSES POPUP ─────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeReward();
});