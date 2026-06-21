// const user = JSON.parse(localStorage.getItem("user"));

// if(user.role !== "student"){
// window.location.href = "teacher-dashboard.html";
// }
// document.addEventListener("DOMContentLoaded", () => {
// const achievements = [
// {
// id: "first_lesson",
// title: "First Voyage",
// desc: "Complete your first lesson",
// xp: 10
// },

// {
// id: "xp_100",
// title: "Rookie Pirate",
// desc: "Reach 100 XP",
// xp: 100
// },

// {
// id: "xp_500",
// title: "Sea Warrior",
// desc: "Reach 500 XP",
// xp: 500
// },

// {
// id: "streak_3",
// title: "On Fire",
// desc: "Study 3 days streak",
// streak: 3
// },

// {
// id: "streak_7",
// title: "Legend",
// desc: "Study 7 days streak",
// streak: 7
// }
// ];
// let unlocked = JSON.parse(localStorage.getItem("achievements")) || [];

// function checkAchievements(){

// // const user = JSON.parse(localStorage.getItem("user"));
// // const xp = user.xp || 0;
// // const streak = parseInt(localStorage.getItem("streak")) || 0;
// const user = JSON.parse(localStorage.getItem("user"));
// checkAchievements(user.xp);
// const xpDisplay = document.getElementById("xpDisplay");
// if(xpDisplay){
// xpDisplay.textContent = user.xp;
// }

// /* ACHIEVEMENT CHECK */

// const xp = user.xp || 0;

// if(xp >= 50 && !localStorage.getItem("ach50")){
// showAchievement("Cabin Boy");
// localStorage.setItem("ach50", true);
// }

// if(xp >= 100 && !localStorage.getItem("ach100")){
// showAchievement("Deckhand");
// localStorage.setItem("ach100", true);
// }

// if(xp >= 200 && !localStorage.getItem("ach200")){
// showAchievement("Swordsman");
// localStorage.setItem("ach200", true);
// }
// achievements.forEach(a => {

// if(unlocked.includes(a.id)) return;

// if(a.xp && xp >= a.xp){
// unlockAchievement(a);
// }

// if(a.streak && streak >= a.streak){
// unlockAchievement(a);
// }

// });

// }
// function unlockAchievement(a){

// unlocked.push(a.id);

// localStorage.setItem("achievements", JSON.stringify(unlocked));

// alert("🏆 Achievement Unlocked: " + a.title);

// }

// const achievementList = document.getElementById("achievementList");

// if(achievementList){

// achievementList.innerHTML = "";

// unlocked.forEach(id => {

// const ach = achievements.find(a => a.id === id);

// const li = document.createElement("li");
// li.textContent = ach.title + " - " + ach.desc;

// achievementList.appendChild(li);

// });

// }
//   const displayUser = document.getElementById("displayUser");
//   const xpDisplay = document.getElementById("xpDisplay");
//   const levelDisplay = document.getElementById("levelDisplay");

//   const userData = localStorage.getItem("user");

//   if (!userData) {
//     window.location.href = "login.html";
//     return;
//   }

//   const user = JSON.parse(userData);

//   displayUser.textContent = user.username;
//   xpDisplay.textContent = user.xp;
//   const lessonCount = document.getElementById("lessonCount");

// if(lessonCount){
// lessonCount.textContent = user.lessonsCompleted;
// }
//   const ranks = [
//     "Cabin Boy",
//     "Deckhand",
//     "Swordsman",
//     "Commander",
//     "Captain",
//     "Warlord",
//     "Yonko",
//     "Pirate King"
//   ];

//   const level = Math.floor(user.xp / 100);

//   levelDisplay.textContent = ranks[level] || "Pirate King";

// });
// const logoutBtn = document.getElementById("logoutBtn");

// if (logoutBtn) {
//   logoutBtn.addEventListener("click", () => {
//     localStorage.clear();
//     window.location.href = "../index.html";
//   });
// }

// // SUBJECT SELECT

// function startLesson(subject){

// localStorage.setItem("currentSubject",subject);

// window.location.href="lesson.html";

// }
// // const streakDisplay = document.getElementById("streakCount");

// // if(streakDisplay){
// //    streakDisplay.textContent = user.streak || 0;
// // }
// const today = new Date().toDateString();
// const lastDate = localStorage.getItem('lastDate');
// let streak = Number(localStorage.getItem('streak')) || 0;

// if (lastDate !== today) {
//   // If yesterday, increase; if they skipped a day, reset to 1
//   const yesterday = new Date();
//   yesterday.setDate(yesterday.getDate() - 1);
  
//   streak = (lastDate === yesterday.toDateString()) ? streak + 1 : 1;
  
//   localStorage.setItem('streak', streak);
//   localStorage.setItem('lastDate', today);
// }

// // Now display it
// const streakDisplay = document.getElementById("streakCount");
// if (streakDisplay) streakDisplay.textContent = streak;

// checkAchievements();
// function showAchievement(text){

// const popup = document.getElementById("achievementPopup");
// const popupText = document.getElementById("achievementText");

// if(!popup) return;

// popupText.textContent = text;

// popup.classList.add("show");

// setTimeout(()=>{
// popup.classList.remove("show");
// },3000);

// }
// function viewNotes(subject){

// localStorage.setItem("notesSubject", subject);

// window.location.href = "notes.html";

// }
// function claimTreasure(){

// const today = new Date().toDateString();
// const lastClaim = localStorage.getItem("lastTreasure");

// const message = document.getElementById("treasureMessage");

// if(lastClaim === today){

// message.innerText = "You already claimed today's treasure 🏴‍☠️";
// return;

// }

// let xp = parseInt(localStorage.getItem("xp")) || 0;

// const reward = Math.floor(Math.random()*40) + 10;

// xp += reward;

// localStorage.setItem("xp", xp);
// localStorage.setItem("lastTreasure", today);

// document.getElementById("xpDisplay").innerText = xp;

// message.innerText = `You found ${reward} bounty!`;

// }
// function startDuel(){
// window.location.href="duel.html";
// }

const BASE_URL = "https://studyverse-backend-28sn.onrender.com";

const RANKS = [
  "Cabin Boy", "Deckhand", "Swordsman", "Commander",
  "Captain", "Warlord", "Yonko", "Pirate King"
];

const achievements = [
  { id: "first_lesson", title: "First Voyage",  desc: "Complete your first lesson", xp: 10 },
  { id: "xp_100",  title: "Cabin Boy",   desc: "Reach 100 Bounty",  xp: 100  },
  { id: "xp_200",  title: "Deckhand",    desc: "Reach 200 Bounty",  xp: 200  },
  { id: "xp_300",  title: "Swordsman",   desc: "Reach 300 Bounty",  xp: 300  },
  { id: "xp_500",  title: "Captain",     desc: "Reach 500 Bounty",  xp: 500  },
  { id: "xp_800",  title: "Pirate King", desc: "Reach 800 Bounty",  xp: 800  },
  { id: "streak_3",title: "On Fire",     desc: "Study 3 days in a row", streak: 3 },
  { id: "streak_7",title: "Legend",      desc: "Study 7 days in a row", streak: 7 },
];

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "login.html"; return; }

  try {
    const res = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
      localStorage.clear();
      window.location.href = "login.html";
      return;
    }

    const user = await res.json();
    localStorage.setItem("user", JSON.stringify(user));

    // Role guard
    if (user.role === "teacher") { window.location.href = "teacher-picker.html"; return; }
    if (user.role === "admin")   { window.location.href = "admin-dashboard.html"; return; }
    if (user.role === "superadmin") { window.location.href = "superadmin-dashboard.html"; return; }

    // Fill UI
    const displayUser   = document.getElementById("displayUser");
    const xpDisplay     = document.getElementById("xpDisplay");
    const levelDisplay  = document.getElementById("levelDisplay");
    const streakCount   = document.getElementById("streakCount");
    const lessonCountEl = document.getElementById("lessonCount");

    if (displayUser)  displayUser.textContent  = user.username;
    if (xpDisplay)    xpDisplay.textContent    = user.xp    || 0;
    if (streakCount)  streakCount.textContent  = user.streak || 0;
    if (lessonCountEl)lessonCountEl.textContent= user.lessonsCompleted || 0;

    const level = Math.min(Math.floor((user.xp || 0) / 100), RANKS.length - 1);
    if (levelDisplay) levelDisplay.textContent = RANKS[level];

    checkAchievements(user.xp || 0, user.streak || 0);

    // Fetch dynamic subjects and render subject cards
    await renderSubjectCards(token);

  } catch (err) {
    console.error("Dashboard load error:", err);
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }
});

// ── DYNAMIC SUBJECT CARDS ─────────────────────────────────────────────────
async function renderSubjectCards(token) {
  const grid = document.getElementById("subjectsGrid");
  if (!grid) return;

  const SUBJECT_CONFIG = {
    "maths":    { icon: "🔢", desc: "Navigate by the stars", color: "#60a5fa" },
    "science":  { icon: "🔬", desc: "Discover the deep",     color: "#4ade80" },
    "english":  { icon: "📜", desc: "Master the written word",color: "#f59e0b" },
    "history":  { icon: "🗺️", desc: "Uncover ancient secrets",color: "#c084fc" },
    "geography":{ icon: "🌍", desc: "Chart unknown waters",  color: "#2dd4bf" },
    "default":  { icon: "📚", desc: "Set sail and learn",    color: "#94a3b8" },
  };

  let subjects = [];
  try {
    const res = await fetch(`${BASE_URL}/api/lessons/my-subjects`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) subjects = await res.json();
  } catch { /* no subjects yet */ }

  // Build cards HTML
  let html = "";

  // Dynamic subject cards
  subjects.forEach(sub => {
    const key    = sub.toLowerCase();
    const config = SUBJECT_CONFIG[key] || SUBJECT_CONFIG["default"];
    html += `
      <div class="subject-card" style="border-color:${config.color}33">
        <h3 style="color:${config.color}">${config.icon} ${sub}</h3>
        <p style="font-family:'IM Fell English',serif;font-size:12px;color:#7aa8cc;font-style:italic;">
          ${config.desc}
        </p>
        <button onclick="startLesson('${sub}')" class="btn-primary" style="margin-bottom:8px">Start Lesson</button>
        <button onclick="viewNotes('${sub}')"   class="btn-outline">View Notes</button>
      </div>`;
  });

  // If no subjects yet — show placeholder
  if (!subjects.length) {
    html += `
      <div class="subject-card" style="border-color:rgba(148,163,184,.2);opacity:.6;grid-column:span 2">
        <h3 style="color:#94a3b8">⏳ No Subjects Yet</h3>
        <p style="font-family:'IM Fell English',serif;font-size:12px;color:#7aa8cc;font-style:italic;">
          Your teacher hasn't uploaded lessons yet. Check back soon, sailor.
        </p>
      </div>`;
  }

  // GK Quiz — always shown
  html += `
    <div class="subject-card" style="border-color:rgba(251,191,36,.25)">
      <h3 style="color:#fbbf24">📰 Daily GK Quest</h3>
      <p style="font-family:'IM Fell English',serif;font-size:12px;color:#7aa8cc;font-style:italic;">
        Today's news. Snake game. Quiz. Conquer all three.
      </p>
      <button onclick="startGKQuiz()" class="btn-primary"
        style="background:linear-gradient(135deg,#92400e,#fbbf24,#f59e0b);color:#1a0e00">
        Start Quest
      </button>
    </div>`;

  // Duel — always shown
  html += `
    <div class="subject-card" style="background:rgba(239,68,68,.06);border-color:rgba(53,113,187,.844);align-items:center;justify-content:center;text-align:center;">
      <h3 style="color:#d8be15">⚔️ Duel Challenge</h3>
      <p style="font-family:'IM Fell English',serif;font-size:12px;color:rgba(150,200,227,.6);font-style:italic;">
        Face another captain at sea
      </p>
      <button class="btn-primary" onclick="startDuel()"
        style="background:linear-gradient(135deg,#e8a500,#f5c842,#ffd966,#e09800);color:rgb(39,22,22);box-shadow:0 4px 15px rgba(245,234,82,.56)">
        Start Duel
      </button>
    </div>`;

  grid.innerHTML = html;
}

// ── ACHIEVEMENTS ──────────────────────────────────────────────────────────
function checkAchievements(xp, streak) {
  let unlocked = JSON.parse(localStorage.getItem("achievements") || "[]");
  achievements.forEach(a => {
    if (unlocked.includes(a.id)) return;
    if (a.xp     && xp     >= a.xp)     unlockAchievement(a, unlocked);
    if (a.streak  && streak >= a.streak) unlockAchievement(a, unlocked);
  });
  const list = document.getElementById("achievementList");
  if (!list) return;
  list.innerHTML = "";
  unlocked.forEach(id => {
    const a  = achievements.find(x => x.id === id);
    if (!a) return;
    const li = document.createElement("li");
    li.textContent = a.title + " — " + a.desc;
    list.appendChild(li);
  });
}

function unlockAchievement(a, unlocked) {
  unlocked.push(a.id);
  localStorage.setItem("achievements", JSON.stringify(unlocked));
  showAchievement("🏆 " + a.title);
}

function showAchievement(text) {
  const popup = document.getElementById("achievementPopup");
  const pt    = document.getElementById("achievementText");
  if (!popup) return;
  pt.textContent = text;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 3000);
}

// ── TREASURE ──────────────────────────────────────────────────────────────
async function claimTreasure() {
  const token   = localStorage.getItem("token");
  const message = document.getElementById("treasureMessage");
  try {
    const res  = await fetch(`${BASE_URL}/api/user/claim-treasure`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById("xpDisplay").textContent = data.xp;
      if (message) message.textContent = `You found ${data.reward} bounty! 🏴‍☠️`;
    } else {
      if (message) message.textContent = data.message;
    }
  } catch {
    if (message) message.textContent = "Server error.";
  }
}

// ── NAVIGATION ────────────────────────────────────────────────────────────
function startLesson(subject) {
  localStorage.setItem("currentSubject", subject);
  window.location.href = "lesson.html";
}

function viewNotes(subject) {
  localStorage.setItem("notesSubject", subject);
  window.location.href = "notes.html";
}

function startGKQuiz() {
  window.location.href = "gk-quiz.html";
}

function startDuel() {
  window.location.href = "duel.html";
}