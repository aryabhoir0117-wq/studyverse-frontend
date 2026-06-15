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

const achievements = [
  { id: "first_lesson", title: "First Voyage", desc: "Complete your first lesson", xp: 10 },
  { id: "xp_100", title: "Cabin Boy", desc: "Reach 100 Bounty", xp: 100 },
  { id: "xp_200", title: "Deckhand", desc: "Reach 200 Bounty", xp: 200 },
  { id: "xp_300", title: "Swordsman", desc: "Reach 300 Bounty", xp: 300 },
  { id: "xp_400", title: "Commander", desc: "Reach 400 Bounty", xp: 400 },
  { id: "xp_500", title: "Captain", desc: "Reach 500 Bounty", xp: 500 },
  { id: "xp_600", title: "Warlord", desc: "Reach 600 Bounty", xp: 600 },
  { id: "xp_700", title: "Yonko", desc: "Reach 700 Bounty", xp: 700 },
  { id: "xp_800", title: "Pirate King", desc: "Reach 800 Bounty", xp: 800 },
  { id: "streak_3", title: "On Fire", desc: "Study 3 days streak", streak: 3 },
  { id: "streak_7", title: "Legend", desc: "Study 7 days streak", streak: 7 }
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

    document.getElementById("displayUser").textContent = user.username;
    document.getElementById("xpDisplay").textContent = user.xp;
    document.getElementById("levelDisplay").textContent = user.rank;
    document.getElementById("streakCount").textContent = user.streak;
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

function checkAchievements(xp, streak) {
  let unlocked = JSON.parse(localStorage.getItem("achievements")) || [];
  achievements.forEach(a => {
    if (unlocked.includes(a.id)) return;
    if (a.xp && xp >= a.xp) unlockAchievement(a, unlocked);
    if (a.streak && streak >= a.streak) unlockAchievement(a, unlocked);
  });
  const achievementList = document.getElementById("achievementList");
  if (achievementList) {
    achievementList.innerHTML = "";
    unlocked.forEach(id => {
      const ach = achievements.find(a => a.id === id);
      if (!ach) return;
      const li = document.createElement("li");
      li.textContent = ach.title + " - " + ach.desc;
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
  const popup = document.getElementById("achievementPopup");
  const popupText = document.getElementById("achievementText");
  if (!popup) return;
  popupText.textContent = text;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 3000);
}

async function claimTreasure() {
  const token = localStorage.getItem("token");
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

function startLesson(subject) {
  localStorage.setItem("currentSubject", subject);
  window.location.href = "lesson.html";
}

function viewNotes(subject) {
  localStorage.setItem("notesSubject", subject);
  window.location.href = "notes.html";
}

function startDuel() {
  window.location.href = "duel.html";
}