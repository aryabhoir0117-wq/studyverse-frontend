const BASE_URL = "https://studyverse-backend-28sn.onrender.com";
const token    = localStorage.getItem("token");
const user     = JSON.parse(localStorage.getItem("user") || "{}");
let selectedAssignment = null;

if (!token || user.role !== "teacher") {
  window.location.href = "login.html";
}

const ICONS = ["🏴","⚓","🗺️","🧭","🔭","⛵","🌊","🏝️","🗝️","⚔️","🐚","🦜"];

document.addEventListener("DOMContentLoaded", load);
document.getElementById("enterBtn").addEventListener("click", enterDashboard);
async function load() {
  try {
    const res = await fetch(`${BASE_URL}/api/teacher/my-profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    document.getElementById("loadingShip").style.display = "none";
    document.getElementById("loadingTxt").style.display  = "none";

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const profile = await res.json();
console.log(profile.assignments.length);
    // Normalise assignments — handle both populated objects and plain IDs
    const raw = profile.assignments || [];

    if (!raw.length) {
      document.getElementById("noAssignments").style.display = "block";
      document.getElementById("enterBtn").style.display      = "none";
      return;
    }

    document.getElementById("pickerTitle").style.display = "block";
    document.getElementById("pickerSub").style.display   = "block";

    // If only 1 assignment, auto-select and jump straight in
    if (raw.length === 1) {
      storeAssignment(raw[0]);
      enterDashboard();
      return;
    }

    renderCards(raw);

  } catch (e) {
    document.getElementById("loadingShip").style.display = "none";
    document.getElementById("loadingTxt").style.display  = "none";
    showError("Server error: " + e.message);
  }
}

function renderCards(assignments) {
  window._assignments = assignments;
  const grid = document.getElementById("classGrid");
  grid.innerHTML = "";

  assignments.forEach((a, i) => {
    // Support both populated objects and plain strings
    const className   = a.classId?.className   || a.className   || "Class";
    const sectionName = a.sectionId?.sectionName || a.sectionName || "—";
    const subjects    = a.subjects || [];
    const icon        = ICONS[i % ICONS.length];

    const card = document.createElement("div");
    card.className = "class-card";
    card.onclick   = () => selectCard(card, i);
    card.innerHTML = `
      <div class="card-icon">${icon}</div>
      <div class="card-class">${className}</div>
      <div class="card-section">Section ${sectionName}</div>
      <div class="card-subjects">
        ${subjects.map(s => `<span class="subject-chip">${s}</span>`).join("") || '<span class="subject-chip" style="opacity:.5">No subjects</span>'}
      </div>`;
    grid.appendChild(card);
  });
}

function selectCard(el, idx) {
  document.querySelectorAll(".class-card").forEach(c => c.classList.remove("selected"));
  el.classList.add("selected");
  storeAssignment(window._assignments[idx]);
  document.getElementById("enterBtn").classList.add("ready");
}

function storeAssignment(a) {
  selectedAssignment = a;
  localStorage.setItem("activeClassId",     a.classId?._id    || a.classId    || "");
  localStorage.setItem("activeClassname",   a.classId?.className || a.className || "");
  localStorage.setItem("activeSectionId",   a.sectionId?._id  || a.sectionId  || "");
  localStorage.setItem("activeSectionName", a.sectionId?.sectionName || a.sectionName || "");
  localStorage.setItem("activeSubjects",    JSON.stringify(a.subjects || []));
}

function enterDashboard() {
    
  if (!selectedAssignment) return;
  window.location.href = "teacher-dashboard.html";
}

function showError(msg) {
  const el = document.createElement("p");
  el.style.cssText = "color:#f87171;font-size:13px;margin-bottom:16px;font-family:'IM Fell English',serif;font-style:italic;";
  el.textContent = msg;
  document.querySelector(".picker-wrap").insertBefore(el, document.getElementById("classGrid"));
}

