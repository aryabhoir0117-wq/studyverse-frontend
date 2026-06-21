// document.addEventListener("DOMContentLoaded", () => {

// const user = JSON.parse(localStorage.getItem("user"));

// if(!user || user.role !== "teacher"){
// window.location.href = "dashboard.html";
// return;
// }

// const name = document.getElementById("displayTeacher");

// if(name){
// name.textContent = user.username;
// }

// /* Demo stats */

// document.getElementById("lessonCount").textContent =
// localStorage.getItem("teacherLessons") || 0;

// document.getElementById("notesCount").textContent =
// localStorage.getItem("teacherNotes") || 0;

// document.getElementById("studentCount").textContent = "Demo";

// });

// /* Navigation */

// function goCreateLesson(){
// window.location.href="create-lesson.html";
// }

// function goUploadNotes(){
// window.location.href="upload-notes.html";
// }

// function goProgress(){
// alert("Student analytics coming soon");
// }
// const logoutBtn = document.getElementById("logoutBtn");

// if (logoutBtn) {
//   logoutBtn.addEventListener("click", () => {
//     localStorage.clear();
//     window.location.href = "../index.html";
//   });
// }
const BASE_URL = "https://studyverse-backend-28sn.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "login.html"; return; }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role !== "teacher") { window.location.href = "dashboard.html"; return; }

  // If no active class set, send to picker
  const activeClassId   = localStorage.getItem("activeClassId");
  const activeSectionId = localStorage.getItem("activeSectionId");
  if (!activeClassId || !activeSectionId) {
    window.location.href = "teacher-picker.html";
    return;
  }

  // Fill topbar
  const nameEl = document.getElementById("displayTeacher");
  if (nameEl) nameEl.textContent = user.username || "Teacher";

  // Show active context in topbar
  renderContextBadge();

  // Fetch stats for this class+section only
  await loadStats(token);

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }
});

function renderContextBadge() {
  const className   = localStorage.getItem("activeClassname")   || "—";
  const sectionName = localStorage.getItem("activeSectionName") || "—";
  const subjects    = JSON.parse(localStorage.getItem("activeSubjects") || "[]");

  // Inject context badge into topbar
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;

  const badge = document.createElement("div");
  badge.style.cssText = `
    display:flex; align-items:center; gap:10px;
    background:rgba(96,192,233,.1); border:1px solid rgba(96,192,233,.25);
    border-radius:8px; padding:6px 14px; font-size:12px;
  `;
  badge.innerHTML = `
    <span style="font-family:'Cinzel',serif;color:#60c0e9;">
      ${className} · Sec ${sectionName}
    </span>
    <span style="color:#7aa8cc;">${subjects.join(", ")}</span>
    <button onclick="switchClass()" style="
      background:none; border:1px solid rgba(245,200,66,.3);
      color:#f5c842; border-radius:6px; padding:2px 8px;
      font-size:11px; cursor:pointer; font-family:'Cinzel',serif;
    ">Switch</button>
  `;
  topbar.appendChild(badge);
}

async function loadStats(token) {
  const classId   = localStorage.getItem("activeClassId");
  const sectionId = localStorage.getItem("activeSectionId");

  try {
    const [lessonsRes, notesRes] = await Promise.all([
      fetch(`${BASE_URL}/api/lessons/my/lessons?classId=${classId}&sectionId=${sectionId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      }),
      fetch(`${BASE_URL}/api/notes/my-notes?classId=${classId}&sectionId=${sectionId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
    ]);

    const lessons = lessonsRes.ok ? await lessonsRes.json() : [];
    const notes   = notesRes.ok  ? await notesRes.json()   : [];

    const lessonCountEl = document.getElementById("lessonCount");
    const notesCountEl  = document.getElementById("notesCount");
    if (lessonCountEl) lessonCountEl.textContent = Array.isArray(lessons) ? lessons.length : 0;
    if (notesCountEl)  notesCountEl.textContent  = Array.isArray(notes)   ? notes.length   : 0;

    // Student count via admin route
    try {
      const usersRes = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const users    = await usersRes.json();
        const students = users.filter(u =>
          u.role === "student" &&
          String(u.studentProfile?.classId?._id || u.studentProfile?.classId) === classId &&
          String(u.studentProfile?.sectionId?._id || u.studentProfile?.sectionId) === sectionId
        );
        const el = document.getElementById("studentCount");
        if (el) el.textContent = students.length;
      }
    } catch { /* non-critical */ }

  } catch (err) {
    console.error("Stats load failed:", err);
  }
}

// Switch class — go back to picker
function switchClass() {
  localStorage.removeItem("activeClassId");
  localStorage.removeItem("activeClassname");
  localStorage.removeItem("activeSectionId");
  localStorage.removeItem("activeSectionName");
  localStorage.removeItem("activeSubjects");
  window.location.href = "teacher-picker.html";
}

// Navigation — passes active context via localStorage (already set)
function goCreateLesson()  { window.location.href = "create-lesson.html"; }
function goUploadNotes()   { window.location.href = "upload-notes.html"; }
function goProgress()      { window.location.href = "student-progress.html"; }