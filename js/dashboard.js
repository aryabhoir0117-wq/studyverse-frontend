const BASE_URL = "https://studyverse-backend-28sn.onrender.com";

const UNITS = {
  maths:   ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
  science: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
  english: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
  gk:      ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"]
};

const achievements = [
  { id: "first_lesson", title: "First Voyage",  desc: "Complete your first lesson", xp: 10 },
  { id: "xp_100",       title: "Cabin Boy",      desc: "Reach 100 Bounty",           xp: 100 },
  { id: "xp_200",       title: "Deckhand",       desc: "Reach 200 Bounty",           xp: 200 },
  { id: "xp_300",       title: "Swordsman",      desc: "Reach 300 Bounty",           xp: 300 },
  { id: "xp_400",       title: "Commander",      desc: "Reach 400 Bounty",           xp: 400 },
  { id: "xp_500",       title: "Captain",        desc: "Reach 500 Bounty",           xp: 500 },
  { id: "xp_600",       title: "Warlord",        desc: "Reach 600 Bounty",           xp: 600 },
  { id: "xp_700",       title: "Yonko",          desc: "Reach 700 Bounty",           xp: 700 },
  { id: "xp_800",       title: "Pirate King",    desc: "Reach 800 Bounty",           xp: 800 },
  { id: "streak_3",     title: "On Fire",        desc: "Study 3 days streak",        streak: 3 },
  { id: "streak_7",     title: "Legend",         desc: "Study 7 days streak",        streak: 7 }
];

document.addEventListener("DOMContentLoaded", async () => {

  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "login.html"; return; }

  try {
    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 401) { localStorage.clear(); window.location.href = "login.html"; }
      return;
    }

    const user = await response.json();
    localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "teacher") { window.location.href = "teacher-dashboard.html"; return; }

    document.getElementById("displayUser").textContent  = user.username;
    document.getElementById("xpDisplay").textContent    = user.xp;
    document.getElementById("levelDisplay").textContent = user.rank;
    document.getElementById("streakCount").textContent  = user.streak;

    const lessonCount = document.getElementById("lessonCount");
    if (lessonCount) lessonCount.textContent = user.lessonsCompleted;

    checkAchievements(user.xp, user.streak);

  } catch (err) { console.error(err); }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }
});

/* ── UNIT PICKER MODAL ──────────────────────────────── */

function startLesson(subject) {
  // Show unit picker modal instead of going straight to lesson
  showUnitPicker(subject, (unit) => {
    localStorage.setItem("currentSubject", subject);
    localStorage.setItem("currentUnit", unit);
    window.location.href = "lesson.html";
  });
}

function showUnitPicker(subject, onSelect) {
  // Remove any existing modal
  const existing = document.getElementById("unitPickerModal");
  if (existing) existing.remove();

  const units = UNITS[subject] || ["Unit 1","Unit 2","Unit 3","Unit 4","Unit 5"];

  const modal = document.createElement("div");
  modal.id = "unitPickerModal";
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.85);
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(8px);
    animation: fadeIn 0.3s ease;
  `;

  modal.innerHTML = `
    <div style="
      background: linear-gradient(145deg, #1a0c02, #0a1628);
      border: 2px solid #f5c842;
      border-radius: 20px;
      padding: 40px 48px;
      max-width: 480px; width: 90%;
      text-align: center;
      box-shadow: 0 0 80px rgba(245,200,66,0.2), 0 20px 60px rgba(0,0,0,0.8);
      position: relative;
    ">
      <button onclick="document.getElementById('unitPickerModal').remove()"
        style="position:absolute;top:16px;right:20px;background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">✕</button>

      <div style="font-size:36px;margin-bottom:12px;">⚓</div>
      <h2 style="font-family:'Cinzel Decorative',cursive;color:#f5c842;font-size:20px;letter-spacing:2px;margin-bottom:6px;">
        Choose Your Unit
      </h2>
      <p style="font-family:'Crimson Pro',serif;font-size:15px;color:rgba(240,232,212,0.5);margin-bottom:28px;">
        ${subject.toUpperCase()} — Select a unit to begin the voyage
      </p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        ${units.map((unit, i) => `
          <button
            onclick="handleUnitSelect('${subject}', '${unit}')"
            style="
              padding: 16px 12px;
              background: rgba(255,209,102,0.07);
              border: 1px solid rgba(255,209,102,0.25);
              border-radius: 12px;
              color: #f0e8d4;
              font-family: 'Cinzel', serif;
              font-size: 12px; letter-spacing: 1px;
              cursor: pointer;
              transition: all 0.2s ease;
              animation: fadeUp 0.3s ease ${i * 0.05}s both;
            "
            onmouseover="this.style.background='rgba(255,209,102,0.15)';this.style.borderColor='#f5c842';this.style.color='#f5c842';this.style.transform='translateY(-2px)'"
            onmouseout="this.style.background='rgba(255,209,102,0.07)';this.style.borderColor='rgba(255,209,102,0.25)';this.style.color='#f0e8d4';this.style.transform='translateY(0)'"
          >
            📜 ${unit}
          </button>
        `).join("")}
      </div>
    </div>
  `;

  // Inject animation keyframes once
  if (!document.getElementById("unitPickerStyles")) {
    const style = document.createElement("style");
    style.id = "unitPickerStyles";
    style.textContent = `
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    `;
    document.head.appendChild(style);
  }

  // Store callback so button can call it
  window._unitPickerCallback = onSelect;
  document.body.appendChild(modal);
}

// Called by inline onclick in modal
window.handleUnitSelect = function(subject, unit) {
  document.getElementById("unitPickerModal").remove();
  if (typeof window._unitPickerCallback === "function") {
    window._unitPickerCallback(unit);
  }
};

/* ── NOTES ──────────────────────────────────────────── */

function viewNotes(subject) {
  localStorage.setItem("notesSubject", subject);
  window.location.href = "notes.html";
}

/* ── DUEL ───────────────────────────────────────────── */

function startDuel() {
  window.location.href = "duel.html";
}

/* ── TREASURE ───────────────────────────────────────── */

async function claimTreasure() {
  const token   = localStorage.getItem("token");
  const message = document.getElementById("treasureMessage");
  try {
    const response = await fetch(`${BASE_URL}/api/user/claim-treasure`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();
    if (response.ok) {
      document.getElementById("xpDisplay").textContent = data.xp;
      message.textContent = `You found ${data.reward} bounty! 🏴‍☠️`;
    } else {
      message.textContent = data.message;
    }
  } catch (err) { message.textContent = "Server error."; }
}

/* ── ACHIEVEMENTS ───────────────────────────────────── */

function checkAchievements(xp, streak) {
  let unlocked = JSON.parse(localStorage.getItem("achievements")) || [];
  achievements.forEach(a => {
    if (unlocked.includes(a.id)) return;
    if (a.xp     && xp     >= a.xp)     unlockAchievement(a, unlocked);
    if (a.streak  && streak >= a.streak) unlockAchievement(a, unlocked);
  });
  const achievementList = document.getElementById("achievementList");
  if (achievementList) {
    achievementList.innerHTML = "";
    unlocked.forEach(id => {
      const ach = achievements.find(a => a.id === id);
      if (!ach) return;
      const li = document.createElement("li");
      li.textContent = ach.title + " — " + ach.desc;
      achievementList.appendChild(li);
    });
  }
}

function unlockAchievement(a, unlocked) {
  unlocked.push(a.id);
  localStorage.setItem("achievements", JSON.stringify(unlocked));
  showAchievement("🏆 " + a.title);
}

function showAchievement(text) {
  const popup     = document.getElementById("achievementPopup");
  const popupText = document.getElementById("achievementText");
  if (!popup) return;
  popupText.textContent = text;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 3000);
}