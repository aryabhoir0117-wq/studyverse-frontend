/* ============================================================
   StudyVerse — GK Quiz JS
   Flow: Loading → Snake Game → Headlines → Battle → Results
   ============================================================ */

const BASE_URL = "https://studyverse-backend-28sn.onrender.com";
const token    = localStorage.getItem("token");
if (!token) location.href = "login.html";

// ── STATE ─────────────────────────────────────────────────────
let quizData       = null;
let collectedCoins = 0;
let playerHP       = 100;
let enemyHP        = 100;
let combo          = 0;
let bestStreak     = 0;
let qIndex         = 0;
let userAnswers    = [];
let battleLocked   = false;
let battleAnimFrame= null;
let particles      = [];
let waveOffset     = 0;
let currentEnemy   = null;
let battleCtx      = null;
let battleCv       = null;

// ── PHASE SWITCHER ────────────────────────────────────────────
function showPhase(id) {
  document.querySelectorAll(".phase").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ══════════════════════════════════════════════════════════════
// PHASE 1 — LOADING
// ══════════════════════════════════════════════════════════════
async function init() {
  const bar  = document.getElementById("loadingBar");
  const sub  = document.getElementById("loadingSub");
  let prog   = 0;

  const tick = setInterval(() => {
    prog = Math.min(prog + Math.random() * 15, 85);
    bar.style.width = prog + "%";
  }, 200);

  try {
    const res = await fetch(`${BASE_URL}/api/gk/today`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Server error");
    }

    quizData = await res.json();
    clearInterval(tick);
    bar.style.width = "100%";
    setTimeout(() => {
      showPhase("phase-snake");
      initSnake();
      startWaterAnimation();
    }, 500);

  } catch (e) {
    clearInterval(tick);
    sub.textContent = "Could not load quiz: " + e.message;
  }
}

// ══════════════════════════════════════════════════════════════
// PHASE 2 — SNAKE GAME (pirate theme)
// ══════════════════════════════════════════════════════════════
const CELL = 28, COLS = 20, ROWS = 15;
let snake, dir, nextDir, coins, snakeScore, snakeInterval, coinCount, snakeActive;

const cv  = document.getElementById("snakeCanvas");
const ctx = cv.getContext("2d");
cv.width  = COLS * CELL;
cv.height = ROWS * CELL;

function initSnake() {
  snake       = [{x:10,y:7},{x:9,y:7},{x:8,y:7}];
  dir         = {x:1, y:0};
  nextDir     = {x:1, y:0};
  coins       = [];
  snakeScore  = 0;
  coinCount   = 0;
  collectedCoins = 0;
  snakeActive = false;
  document.getElementById("coinsCollected").textContent = 0;
  document.getElementById("snakeScore").textContent     = 0;
  document.getElementById("coinsNeeded").textContent    = quizData?.headlines?.length || 10;
  spawnCoin();
  drawSnake();
}

function spawnCoin() {
  let pos;
  do {
    pos = { x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS) };
  } while (snake.some(s => s.x===pos.x && s.y===pos.y));
  coins.push(pos);
}

function startSnake() {
  if (snakeActive) return;
  snakeActive = true;
  setSnakeMsg("Collect all 🪙 — dodge the edges!");
  snakeInterval = setInterval(gameLoop, 120);
}

function gameLoop() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    endSnake(false); return;
  }
  if (snake.slice(1).some(s => s.x===head.x && s.y===head.y)) {
    endSnake(false); return;
  }

  snake.unshift(head);

  const coinIdx = coins.findIndex(c => c.x===head.x && c.y===head.y);
  if (coinIdx !== -1) {
    coins.splice(coinIdx, 1);
    coinCount++;
    snakeScore += 10;
    const total = quizData?.headlines?.length || 10;
    collectedCoins = Math.min(coinCount, total);
    document.getElementById("coinsCollected").textContent = collectedCoins;
    document.getElementById("snakeScore").textContent     = snakeScore;
    setSnakeMsg(`📰 Headline ${collectedCoins} unlocked!`);
    if (coinCount < total) spawnCoin();
    else { endSnake(true); return; }
  } else {
    snake.pop();
  }
}

function drawSnake() {
  const t = Date.now() / 1200;

  // Ocean background
  ctx.fillStyle = "#0a1f35";
  ctx.fillRect(0, 0, cv.width, cv.height);

  // Animated water lines
  ctx.strokeStyle = "rgba(96,165,250,.06)";
  ctx.lineWidth   = 1;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const wave = Math.sin(x * 0.4 + t + y * 0.2) * 2;
      ctx.beginPath();
      ctx.moveTo(x*CELL,       y*CELL + CELL/2 + wave);
      ctx.lineTo((x+1)*CELL,   y*CELL + CELL/2 + wave);
      ctx.stroke();
    }
  }

  // Grid
  ctx.strokeStyle = "rgba(96,165,250,.04)";
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath(); ctx.moveTo(x*CELL, 0); ctx.lineTo(x*CELL, cv.height); ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath(); ctx.moveTo(0, y*CELL); ctx.lineTo(cv.width, y*CELL); ctx.stroke();
  }

  // Snake body
  snake.forEach((seg, i) => {
    if (i === 0) return;
    const alpha = 1 - (i / snake.length) * 0.5;
    ctx.fillStyle = `rgba(201,162,39,${alpha})`;
    const pad = 3;
    ctx.beginPath();
    ctx.roundRect(seg.x*CELL+pad, seg.y*CELL+pad, CELL-pad*2, CELL-pad*2, 4);
    ctx.fill();
    ctx.fillStyle = `rgba(245,200,66,${alpha*0.3})`;
    ctx.beginPath();
    ctx.arc(seg.x*CELL+CELL/2, seg.y*CELL+CELL/2, CELL*0.2, 0, Math.PI);
    ctx.fill();
  });

  // Snake head = ship emoji
  const rot = dir.x===1?0 : dir.x===-1?Math.PI : dir.y===1?Math.PI/2 : -Math.PI/2;
  ctx.save();
  ctx.font = `${CELL-4}px serif`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.translate(snake[0].x*CELL+CELL/2, snake[0].y*CELL+CELL/2);
  ctx.rotate(rot);
  ctx.fillText("⛵", 0, 0);
  ctx.restore();

  // Coins with pulse glow
  coins.forEach(c => {
    const pulse = 0.7 + Math.sin(Date.now()/300)*0.3;
    ctx.shadowColor = "#fbbf24";
    ctx.shadowBlur  = 12 * pulse;
    ctx.font        = `${CELL-6}px serif`;
    ctx.textAlign   = "center";
    ctx.textBaseline= "middle";
    ctx.fillText("🪙", c.x*CELL+CELL/2, c.y*CELL+CELL/2);
    ctx.shadowBlur  = 0;
  });

  // HUD
  ctx.fillStyle    = "rgba(245,200,66,.85)";
  ctx.font         = "bold 12px 'Cinzel',serif";
  ctx.textAlign    = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`Headlines: ${collectedCoins}/${quizData?.headlines?.length||10}`, 10, 8);
}

function startWaterAnimation() {
  function frame() {
    if (document.getElementById("phase-snake").classList.contains("active")) {
      drawSnake();
      requestAnimationFrame(frame);
    }
  }
  requestAnimationFrame(frame);
}

function endSnake(won) {
  clearInterval(snakeInterval);
  snakeActive = false;
  if (won) {
    setSnakeMsg("🏴‍☠️ All headlines collected! Anchors aweigh!");
    setTimeout(showHeadlines, 1200);
  } else {
    setSnakeMsg(`💀 Wrecked! Collected ${collectedCoins} headlines. Try again or skip.`);
  }
}

function skipSnake() {
  clearInterval(snakeInterval);
  snakeActive    = false;
  collectedCoins = quizData?.headlines?.length || 10;
  showHeadlines();
}

function setSnakeMsg(msg) {
  document.getElementById("snakeMsg").textContent = msg;
}

document.addEventListener("keydown", e => {
  const map = {
    ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1},
    ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0},
    w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0},
    W:{x:0,y:-1}, S:{x:0,y:1}, A:{x:-1,y:0}, D:{x:1,y:0}
  };
  if (map[e.key]) {
    const nd = map[e.key];
    if (nd.x !== -dir.x || nd.y !== -dir.y) nextDir = nd;
    if (!snakeActive) startSnake();
    e.preventDefault();
  }
});

// ══════════════════════════════════════════════════════════════
// PHASE 3 — HEADLINES
// ══════════════════════════════════════════════════════════════
function showHeadlines() {
  showPhase("phase-headlines");
  const grid      = document.getElementById("headlinesGrid");
  const headlines = quizData?.headlines || [];
  grid.innerHTML  = "";

  headlines.forEach((h, i) => {
    const card = document.createElement("div");
    const locked = i >= collectedCoins;
    card.className = "headline-card" + (locked ? " locked" : "");
    card.style.transitionDelay = (i * 80) + "ms";
    card.innerHTML = `
      <div class="headline-emoji">${h.emoji || "📰"}</div>
      <div class="headline-title">${h.title}</div>
      <div class="headline-brief">${h.brief}</div>
      ${locked ? '<div class="locked-overlay">🔒</div>' : ""}`;
    grid.appendChild(card);
    setTimeout(() => card.classList.add("visible"), 50 + i * 80);
  });
}

// ══════════════════════════════════════════════════════════════
// PHASE 4 — BATTLE ENGINE
// ══════════════════════════════════════════════════════════════
const ENEMIES = [
  { name: "Storm Kraken",  emoji: "🦑" },
  { name: "Sea Serpent",   emoji: "🐉" },
  { name: "Ghost Galleon", emoji: "👻" },
];

function startBattle() {
  showPhase("phase-battle");
  qIndex       = 0;
  userAnswers  = [];
  playerHP     = 100;
  enemyHP      = 100;
  combo        = 0;
  bestStreak   = 0;
  battleLocked = false;
  particles    = [];
  currentEnemy = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];

  battleCv  = document.getElementById("battleCanvas");
  battleCtx = battleCv.getContext("2d");
  battleCv.width  = Math.min(window.innerWidth, 860);
  battleCv.height = 500;

  document.getElementById("enemyLabel").textContent = currentEnemy.emoji + " " + currentEnemy.name;
  document.getElementById("playerHB").style.width = "100%";
  document.getElementById("enemyHB").style.width  = "100%";

  if (battleAnimFrame) cancelAnimationFrame(battleAnimFrame);
  drawBattleBG();
  loadQuestion();
}

function drawBattleBG() {
  if (!battleCtx) return;
  const W = battleCv.width, H = battleCv.height;

  // Sky
  const sky = battleCtx.createLinearGradient(0, 0, 0, H * 0.6);
  sky.addColorStop(0,   "#0d1b2a");
  sky.addColorStop(0.5, "#1a3a5c");
  sky.addColorStop(1,   "#0f2d4a");
  battleCtx.fillStyle = sky;
  battleCtx.fillRect(0, 0, W, H);

  // Stars
  for (let i = 0; i < 80; i++) {
    const sx = (i * 137.5 + 20) % W;
    const sy = (i * 97.3  + 10) % (H * 0.55);
    const r  = Math.sin(Date.now() / 800 + i) * 0.5 + 0.5;
    battleCtx.globalAlpha = 0.3 + r * 0.7;
    battleCtx.fillStyle   = "#fff";
    battleCtx.fillRect(sx, sy, 1.5, 1.5);
  }
  battleCtx.globalAlpha = 1;

  // Moon
  battleCtx.fillStyle   = "rgba(255,240,200,.85)";
  battleCtx.shadowColor = "rgba(255,240,200,.4)";
  battleCtx.shadowBlur  = 20;
  battleCtx.beginPath();
  battleCtx.arc(W * 0.82, H * 0.12, 28, 0, Math.PI * 2);
  battleCtx.fill();
  battleCtx.shadowBlur = 0;

  // Ocean
  waveOffset += 0.02;
  const ocean = battleCtx.createLinearGradient(0, H * 0.55, 0, H);
  ocean.addColorStop(0, "#0d3050");
  ocean.addColorStop(1, "#071828");
  battleCtx.fillStyle = ocean;
  battleCtx.fillRect(0, H * 0.55, W, H * 0.45);

  // Waves
  for (let w = 0; w < 3; w++) {
    battleCtx.strokeStyle = `rgba(96,165,250,${0.15 - w * 0.04})`;
    battleCtx.lineWidth   = 2 - w * 0.5;
    battleCtx.beginPath();
    for (let x = 0; x <= W; x += 4) {
      const y = H * (0.56 + w * 0.04) + Math.sin(x / 60 + waveOffset + w * 1.2) * 8;
      x === 0 ? battleCtx.moveTo(x, y) : battleCtx.lineTo(x, y);
    }
    battleCtx.stroke();
  }

  // Ships
  battleCtx.font        = "52px serif";
  battleCtx.textAlign   = "center";
  battleCtx.textBaseline = "middle";
  battleCtx.fillText("⛵", W * 0.18, H * 0.52 + Math.sin(Date.now() / 700) * 4);
  battleCtx.font = "58px serif";
  battleCtx.fillText(currentEnemy?.emoji || "🦑", W * 0.78, H * 0.5 + Math.sin(Date.now() / 900 + 1) * 5);

  // Particles
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    battleCtx.globalAlpha = p.life / p.maxLife;
    battleCtx.font        = p.size + "px serif";
    battleCtx.fillText(p.emoji, p.x, p.y);
    p.x += p.vx; p.y += p.vy; p.life--;
    battleCtx.globalAlpha = 1;
  });

  battleAnimFrame = requestAnimationFrame(drawBattleBG);
}

function spawnParticles(x, y, emoji, count = 6) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: -(Math.random() * 4 + 1),
      emoji,
      size:    18 + Math.random() * 12,
      life:    30 + Math.random() * 20,
      maxLife: 50
    });
  }
}

function floatDmg(text, x, y, cls) {
  const el = document.createElement("div");
  el.className = `dmg-num ${cls}`;
  el.textContent = text;
  el.style.cssText = `left:${x}px;top:${y}px;position:fixed;pointer-events:none;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function loadQuestion() {
  if (!quizData?.questions || qIndex >= quizData.questions.length) {
    endBattle(); return;
  }
  const q = quizData.questions[qIndex];
  document.getElementById("questionText").textContent = q.question;
  const grid = document.getElementById("optionsGrid");
  grid.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className   = "opt-btn";
    btn.textContent = opt;
    btn.onclick     = () => answer(i);
    grid.appendChild(btn);
  });
  battleLocked = false;
}

function answer(idx) {
  if (battleLocked) return;
  battleLocked = true;

  const q    = quizData.questions[qIndex];
  const btns = document.querySelectorAll(".opt-btn");
  const W    = battleCv?.width  || 800;
  const H    = battleCv?.height || 500;

  userAnswers.push(idx);

  if (idx === q.answer) {
    btns[idx].classList.add("correct");
    combo++;
    bestStreak = Math.max(bestStreak, combo);
    const dmg  = 20 + combo * 2;
    enemyHP    = Math.max(0, enemyHP - dmg);
    spawnParticles(W * 0.22, H * 0.48, "💥", 8);
    spawnParticles(W * 0.78, H * 0.46, "⭐", 5);
    floatDmg(`-${dmg}`, W * 0.72, H * 0.3, "red");
    document.getElementById("enemyHB").style.width     = enemyHP + "%";
    document.getElementById("comboDisplay").textContent = `Combo: ${combo}`;
    document.getElementById("streakDisplay").textContent= `🔥 Streak: ${bestStreak}`;
  } else {
    btns[idx].classList.add("wrong");
    btns[q.answer].classList.add("correct");
    combo    = 0;
    playerHP = Math.max(0, playerHP - 20);
    spawnParticles(W * 0.18, H * 0.48, "💔", 5);
    floatDmg("-20", W * 0.14, H * 0.3, "red");
    document.getElementById("phase-battle").classList.add("shaking");
    setTimeout(() => document.getElementById("phase-battle").classList.remove("shaking"), 400);
    document.getElementById("playerHB").style.width     = playerHP + "%";
    document.getElementById("comboDisplay").textContent = "Combo: 0";
  }

  setTimeout(() => {
    qIndex++;
    if (playerHP <= 0 || enemyHP <= 0 || qIndex >= quizData.questions.length) {
      endBattle();
    } else {
      loadQuestion();
    }
  }, 1400);
}

async function endBattle() {
  cancelAnimationFrame(battleAnimFrame);
  const correct = userAnswers.filter((a, i) => a === quizData.questions[i]?.answer).length;
  const xp      = correct * 20 + bestStreak * 5;

  try {
    await fetch(`${BASE_URL}/api/gk/submit`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body:    JSON.stringify({ answers: userAnswers, date: quizData.date })
    });
  } catch (e) { console.error("Submit error:", e); }

  showPhase("phase-results");
  const won = correct >= 3;
  document.getElementById("resultsIcon").textContent  = won ? "🏆" : "⚔️";
  document.getElementById("resultsTitle").textContent = won ? "Victory!" : "Battle Over";
  document.getElementById("resultsTitle").style.color = won ? "#f5c842" : "#f87171";
  document.getElementById("resultsSub").textContent   = won
    ? `${correct}/5 correct — ${xp} XP earned. The seas are yours, Captain!`
    : `${correct}/5 correct — Train harder and return!`;
  document.getElementById("resCorrect").textContent   = `${correct}/5`;
  document.getElementById("resXP").textContent        = xp;
  document.getElementById("resStreak").textContent    = bestStreak;

  document.getElementById("resultsBreakdown").innerHTML =
    quizData.questions.map((q, i) => {
      const ok = userAnswers[i] === q.answer;
      return `
        <div class="result-row ${ok ? "correct-row" : "wrong-row"}">
          <div class="result-icon">${ok ? "✅" : "❌"}</div>
          <div>
            <div class="result-q">${q.question}</div>
            <div class="result-exp">${q.explanation}</div>
          </div>
        </div>`;
    }).join("");
}

// ── BUTTON WIRING ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startBtn").addEventListener("click", startSnake);
  document.getElementById("skipBtn").addEventListener("click", skipSnake);
  document.getElementById("enterBattleBtn").addEventListener("click", startBattle);
  document.getElementById("returnBtn").addEventListener("click", () => location.href = "dashboard.html");
  document.getElementById("retryBtn").addEventListener("click", startBattle);
  init();
});