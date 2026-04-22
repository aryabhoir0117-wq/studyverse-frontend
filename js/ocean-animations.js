/* ============================================================
   STUDYVERSE — OCEAN ANIMATION ENGINE
   ocean-animations.js
   Drop this AFTER your existing dashboard.js / teacher-dashboard.js
   It does NOT touch your logic — only injects visual layers.
   ============================================================ */

(function StudyVerseOcean() {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────
  const CFG = {
    theme:         'night',   // 'day' | 'night'
    starCount:     120,
    biolumiCount:  18,
    lightRayCount: 6,
    islandCount:   2,
    floatOffsets:  [],        // per-card phase offsets
    ripplePool:    [],
  };

  // ── INIT ────────────────────────────────────────────────────
  function init() {
    injectOceanWorld();
    injectThemeToggle();
    applyTheme(loadSavedTheme());
    initFloatingCards();
    initCardEntrances();
    initRippleListeners();
  }

  // ── OCEAN WORLD DOM ─────────────────────────────────────────
  function injectOceanWorld() {
    const world = document.createElement('div');
    world.className = 'ocean-world';
    world.id = 'oceanWorld';

    world.innerHTML = `
      <div class="sky-layer"></div>
      <div class="sun-glow"></div>
      ${buildLightRays()}
      ${buildStars()}
      <div class="moon"></div>
      <div class="moon-reflection"></div>
      <div class="ocean-layer"></div>
      <div class="wave wave-1"></div>
      <div class="wave wave-2"></div>
      <div class="wave wave-3"></div>
      <div class="shimmer-line"></div>
      ${buildIslands()}
      ${buildBiolumi()}
      <div class="stars-layer" id="starsLayer"></div>
    `;

    document.body.insertBefore(world, document.body.firstChild);
  }

  function buildStars() {
    let html = '';
    for (let i = 0; i < CFG.starCount; i++) {
      const x    = Math.random() * 100;
      const y    = Math.random() * 60;
      const size = 0.8 + Math.random() * 2.2;
      const dur  = 1.5 + Math.random() * 3;
      const del  = Math.random() * 4;
      html += `<div class="star" style="
        left:${x}%;top:${y}%;
        width:${size}px;height:${size}px;
        animation-duration:${dur}s;
        animation-delay:${del}s;
      "></div>`;
    }
    return `<div class="stars-layer">${html}</div>`;
  }

  function buildBiolumi() {
    let html = '';
    for (let i = 0; i < CFG.biolumiCount; i++) {
      const x    = 5 + Math.random() * 90;
      const y    = 62 + Math.random() * 30;
      const size = 4 + Math.random() * 10;
      const dur  = 3 + Math.random() * 5;
      const del  = Math.random() * 8;
      const hue  = Math.random() > 0.5 ? '180, 220, 255' : '120, 255, 200';
      html += `<div class="biolumi-particle" style="
        left:${x}%;top:${y}%;
        width:${size}px;height:${size}px;
        background:radial-gradient(circle, rgba(${hue},0.85), transparent);
        animation-duration:${dur}s;
        animation-delay:${del}s;
      "></div>`;
    }
    return html;
  }

  function buildLightRays() {
    let html = '';
    for (let i = 0; i < CFG.lightRayCount; i++) {
      const x   = 30 + Math.random() * 40;
      const rot = -8 + Math.random() * 16;
      const dur = 4 + Math.random() * 4;
      const del = Math.random() * 3;
      html += `<div class="light-ray" style="
        left:${x}%;
        transform:rotate(${rot}deg);
        animation-duration:${dur}s;
        animation-delay:${del}s;
      "></div>`;
    }
    return html;
  }

  function buildIslands() {
    const islands = [
      { bottom: '42%', left: '6%',  w: '90px', h: '30px', opacity: 0.28 },
      { bottom: '41%', right: '8%', w: '60px', h: '20px', opacity: 0.22 },
    ];
    return islands.map(i => `
      <div class="distant-island" style="
        bottom:${i.bottom};
        ${i.left ? 'left:' + i.left : 'right:' + i.right};
        width:${i.w};height:${i.h};
        opacity:${i.opacity};
      "></div>
    `).join('');
  }

  // ── THEME TOGGLE ─────────────────────────────────────────────
  function injectThemeToggle() {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle-btn';
    btn.id = 'themeToggleBtn';
    btn.setAttribute('aria-label', 'Toggle day/night');
    updateToggleLabel(btn, CFG.theme);
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'day' ? 'night' : 'day';
      applyTheme(next);
      localStorage.setItem('sv_theme', next);
    });
    document.body.appendChild(btn);
  }

  function updateToggleLabel(btn, theme) {
    btn.textContent = theme === 'day' ? 'Night Watch' : 'Dawn Watch';
  }

  function applyTheme(theme) {
    CFG.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('themeToggleBtn');
    if (btn) updateToggleLabel(btn, theme);
  }

  function loadSavedTheme() {
    return localStorage.getItem('sv_theme') || 'night';
  }

  // ── FLOATING CARDS ───────────────────────────────────────────
  function initFloatingCards() {
    const cards = document.querySelectorAll('.stat-card, .subject-card');

    cards.forEach((card, i) => {
      // Inject ripple ring
      if (!card.querySelector('.card-ripple')) {
        const ripple = document.createElement('div');
        ripple.className = 'card-ripple';
        card.appendChild(ripple);
      }

      // Stagger the float animation phase
      const duration = 5 + (i % 4);        // 5–8 seconds
      const delay    = -(i * 0.9);          // negative delay = pre-offset phase
      card.classList.add('floating-card');
      card.style.animationDuration = duration + 's';
      card.style.animationDelay    = delay + 's';
    });
  }

  // ── CARD ENTRANCE ANIMATION ──────────────────────────────────
  function initCardEntrances() {
    const cards = document.querySelectorAll('.stat-card, .subject-card');
    cards.forEach((card, i) => {
      card.classList.add('float-in');
      card.style.animationDelay = (i * 0.1) + 's';
      // Remove the entrance class after it plays so floating takes over cleanly
      card.addEventListener('animationend', () => {
        // Only remove float-in, keep floating-card
        if (card.classList.contains('float-in')) {
          card.classList.remove('float-in');
          card.style.animationDelay = -(i * 0.9) + 's';
        }
      }, { once: true });
    });
  }

  // ── RIPPLE ON CLICK ──────────────────────────────────────────
  function initRippleListeners() {
    document.querySelectorAll('.stat-card, .subject-card').forEach(card => {
      card.addEventListener('click', (e) => spawnWaterRipple(e, card));
    });
  }

  function spawnWaterRipple(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute;
      left:${x}px;top:${y}px;
      width:6px;height:6px;
      border-radius:50%;
      background:radial-gradient(circle, rgba(255,255,255,0.5), transparent);
      transform:translate(-50%,-50%) scale(0);
      animation:clickRippleExpand 0.7s ease forwards;
      pointer-events:none;
      z-index:100;
    `;
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  // Inject click ripple keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes clickRippleExpand {
      0%   { transform:translate(-50%,-50%) scale(0);   opacity:1; }
      100% { transform:translate(-50%,-50%) scale(20);  opacity:0; }
    }
  `;
  document.head.appendChild(style);

  // ── XP GOLD PARTICLE BURST ───────────────────────────────────
  // Call this from your existing dashboard.js after XP is awarded
  window.svBurstGold = function(originX, originY, count = 18) {
    const colors = ['#ffd700', '#f5c842', '#ffe066', '#ffaa00', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const angle  = (360 / count) * i + (Math.random() * 15);
      const dist   = 40 + Math.random() * 80;
      const rad    = (angle * Math.PI) / 180;
      const tx     = Math.cos(rad) * dist;
      const ty     = Math.sin(rad) * dist;
      const size   = 4 + Math.random() * 6;
      const color  = colors[Math.floor(Math.random() * colors.length)];
      const dur    = 0.6 + Math.random() * 0.5;

      particle.className = 'xp-particle';
      particle.style.cssText = `
        left:${originX}px;top:${originY}px;
        width:${size}px;height:${size}px;
        background:${color};
        box-shadow:0 0 6px ${color};
        --fly-to: translate(${tx}px, ${ty}px);
        animation-duration:${dur}s;
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      `;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), dur * 1000 + 50);
    }
  };

  // ── DUEL STORM TRANSITION ────────────────────────────────────
  // Call window.svDuelStart() from your startDuel() function
  window.svDuelStart = function(callback) {
    let overlay = document.getElementById('duelStormOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'duelStormOverlay';
      overlay.className = 'duel-storm-overlay';
      document.body.appendChild(overlay);
    }
    overlay.classList.add('active');

    setTimeout(() => {
      const flash = document.createElement('div');
      flash.className = 'lightning-flash';
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 200);
    }, 300);

    setTimeout(() => {
      const flash2 = document.createElement('div');
      flash2.className = 'lightning-flash';
      document.body.appendChild(flash2);
      setTimeout(() => flash2.remove(), 200);
    }, 550);

    setTimeout(() => {
      overlay.classList.remove('active');
      if (typeof callback === 'function') callback();
    }, 900);
  };

  // ── SPLASH SUBJECT TRANSITION ────────────────────────────────
  // Call window.svSubjectSplash(color, callback) from startLesson()
  window.svSubjectSplash = function(subjectKey, callback) {
    const colorMap = {
      maths:   '#3ab0ff',
      science: '#50ffb0',
      english: '#c878ff',
      gk:      '#ffb840',
    };
    const color = colorMap[subjectKey] || '#f5c842';

    const splash = document.createElement('div');
    splash.style.cssText = `
      position:fixed;inset:0;z-index:9998;pointer-events:none;
      background:radial-gradient(ellipse at center, ${color}22 0%, ${color}00 70%);
      animation:svSplashIn 0.5s ease forwards;
    `;
    const kf = document.createElement('style');
    kf.textContent = `
      @keyframes svSplashIn {
        0%   { opacity:0; }
        40%  { opacity:1; }
        100% { opacity:0; }
      }
    `;
    document.head.appendChild(kf);
    document.body.appendChild(splash);

    setTimeout(() => {
      splash.remove();
      kf.remove();
      if (typeof callback === 'function') callback();
    }, 500);
  };

  // ── CARD SUBJECT CLASS ASSIGNMENT ────────────────────────────
  function assignSubjectClasses() {
    const cards = document.querySelectorAll('.subject-card');
    const subjectMap = ['math-card', 'science-card', 'english-card', 'gk-card'];
    cards.forEach((card, i) => {
      if (subjectMap[i]) card.classList.add(subjectMap[i]);
    });
  }

  // ── STREAK INDICATOR ─────────────────────────────────────────
  // Adds a subtle glow to the streak counter
  function styleStreakCounter() {
    const streak = document.getElementById('streakCount');
    if (!streak) return;
    const parent = streak.parentElement;
    if (parent) {
      parent.style.fontFamily = "'Cinzel', serif";
      parent.style.fontSize   = "13px";
      parent.style.color      = "var(--gold, #f5c842)";
      parent.style.letterSpacing = "0.08em";
    }
    streak.style.fontFamily = "'Cinzel Decorative', cursive";
    streak.style.color      = "var(--gold-bright, #ffe066)";
    streak.style.textShadow = "0 0 10px rgba(245,200,66,0.6)";
  }

  // ── BOOT ─────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      assignSubjectClasses();
      styleStreakCounter();
    });
  } else {
    init();
    assignSubjectClasses();
    styleStreakCounter();
  }

})();