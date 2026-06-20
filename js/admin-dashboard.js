const API = "https://studyverse-backend-28sn.onrender.com";

let allUsers   = [];
let classes    = [];
let sections   = [];
let _assigningUserId = null;
let _resetUserId     = null;
const token = localStorage.getItem("token");
const user  = JSON.parse(localStorage.getItem("user") || "{}");

// ── AUTH GUARD ────────────────────────────────────────────────────────────
if (!token || !["admin","superadmin"].includes(user.role)) {
  window.location.href = "login.html";
}

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("adminName").textContent    = user.username || "Admin";
  document.getElementById("adminInitials").textContent = (user.username || "A")[0].toUpperCase();
  await Promise.all([loadUsers(), loadClasses(), loadSections(), loadAnalytics()]);
  renderOverview();
});

// ── API HELPER ────────────────────────────────────────────────────────────
async function api(path, method = "GET", body = null) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(`${API}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── LOAD DATA ─────────────────────────────────────────────────────────────
async function loadUsers() {
  try { allUsers = await api("/api/admin/users"); }
  catch (e) { toast(e.message, "error"); }
}
async function loadClasses() {
  try {
    classes = await api("/api/admin/classes");
    populateClassSelects();
  }
  catch (e) { console.error(e); }
}
async function loadSections() {
  try {
    sections = await api("/api/admin/sections");
    populateSectionFilter();
  }
  catch (e) { console.error(e); }
}
async function loadAnalytics() {
  try {
    const a = await api("/api/admin/analytics");
    document.getElementById("st-teachers").textContent = a.teachers;
    document.getElementById("st-students").textContent = a.students;
    document.getElementById("st-classes").textContent  = a.classes;
    document.getElementById("st-sections").textContent = a.sections;
    document.getElementById("st-blocked").textContent  = a.blocked;
    document.getElementById("st-pending").textContent  = a.firstLogin;
    renderAnalyticsTab(a);
  } catch (e) { console.error(e); }
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────
function renderOverview() {
  // Stats already set by loadAnalytics
  const schoolLabel = document.getElementById("schoolLabel");
  if (schoolLabel) schoolLabel.textContent = user.schoolId ? "School Panel" : "Admin Panel";
}

// ── TAB SWITCHING ─────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(`tab-${name}`)?.classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b => {
    if (b.textContent.toLowerCase().includes(name.slice(0,4))) b.classList.add("active");
  });
  document.getElementById("tabTitle").textContent = name.charAt(0).toUpperCase() + name.slice(1);
  if (name === "teachers") renderTeachers();
  if (name === "students") renderStudents();
  if (name === "classes")  renderClasses();
  if (name === "sections") renderSections();
}

// ── TEACHERS ──────────────────────────────────────────────────────────────
function renderTeachers() {
  const q = (document.getElementById("teacherSearch")?.value || "").toLowerCase();
  const list = allUsers.filter(u =>
    u.role === "teacher" &&
    (u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  );
  const tbody = document.getElementById("teacherTbody");
  if (!list.length) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:24px">No teachers found</td></tr>`; return; }

  tbody.innerHTML = list.map(u => {
    const tp = u.teacherProfile;
    const subjects = tp?.subjectsAssigned?.join(", ") || "—";
    return `
      <tr>
        <td><strong>${u.username}</strong></td>
        <td style="color:var(--muted)">${u.email}</td>
        <td><code style="font-size:11px;background:var(--bg3);padding:1px 6px;border-radius:3px">${tp?.employeeId || "—"}</code></td>
        <td style="color:var(--muted);font-size:12px">${subjects}</td>
        <td>
          ${u.isBlocked ? '<span class="badge badge-blocked">Blocked</span>' : '<span class="badge badge-active">Active</span>'}
          ${u.isFirstLogin ? '<span class="badge badge-pending" style="margin-left:4px">Pending</span>' : ""}
        </td>
        <td>
          <button class="act reset-btn"   onclick="openResetModal('${u._id}','${u.username}')">🔑 Reset</button>
          ${u.isBlocked
            ? `<button class="act unblock-btn" onclick="toggleBlock('${u._id}',false)">✅ Unblock</button>`
            : `<button class="act block-btn"   onclick="toggleBlock('${u._id}',true)">🚫 Block</button>`
          }
          <button class="act del-btn" onclick="deactivate('${u._id}','${u.username}')">🗑️</button>
        </td>
      </tr>`;
  }).join("");
}

// ── STUDENTS ──────────────────────────────────────────────────────────────
function renderStudents() {
  const q = (document.getElementById("studentSearch")?.value || "").toLowerCase();
  const list = allUsers.filter(u =>
    u.role === "student" &&
    (u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  );
  const tbody = document.getElementById("studentTbody");
  if (!list.length) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:24px">No students found</td></tr>`; return; }

  tbody.innerHTML = list.map(u => {
    const sp  = u.studentProfile;
    const cls = sp?.classId?.className  || "—";
    const sec = sp?.sectionId?.sectionName || "—";
    return `
      <tr>
        <td><strong>${u.username}</strong></td>
        <td style="color:var(--muted)">${u.email}</td>
        <td><code style="font-size:11px;background:var(--bg3);padding:1px 6px;border-radius:3px">${sp?.enrollmentNumber || "—"}</code></td>
        <td>${cls} / ${sec}</td>
        <td>
          ${u.isBlocked ? '<span class="badge badge-blocked">Blocked</span>' : '<span class="badge badge-active">Active</span>'}
          ${u.isFirstLogin ? '<span class="badge badge-pending" style="margin-left:4px">Pending</span>' : ""}
        </td>
        <td>
          <button class="act assign-btn"  onclick="openAssignModal('${u._id}')">📋 Assign</button>
          <button class="act reset-btn"   onclick="openResetModal('${u._id}','${u.username}')">🔑 Reset</button>
          ${u.isBlocked
            ? `<button class="act unblock-btn" onclick="toggleBlock('${u._id}',false)">✅ Unblock</button>`
            : `<button class="act block-btn"   onclick="toggleBlock('${u._id}',true)">🚫 Block</button>`
          }
          <button class="act del-btn" onclick="deactivate('${u._id}','${u.username}')">🗑️</button>
        </td>
      </tr>`;
  }).join("");
}

// ── CLASSES ───────────────────────────────────────────────────────────────
function renderClasses() {
  const grid = document.getElementById("classGrid");
  if (!classes.length) { grid.innerHTML = `<p style="color:var(--muted)">No classes yet.</p>`; return; }
  grid.innerHTML = classes.map(c => {
    const secCount = sections.filter(s => String(s.classId?._id || s.classId) === String(c._id)).length;
    const stuCount = allUsers.filter(u => String(u.studentProfile?.classId?._id || u.studentProfile?.classId) === String(c._id)).length;
    return `
      <div class="item-card">
        <h4>${c.className}</h4>
        <p>${secCount} section(s) · ${stuCount} student(s)</p>
        <div>
          <button class="act del-btn" onclick="deleteClass('${c._id}','${c.className}')">🗑️ Remove</button>
        </div>
      </div>`;
  }).join("");
}

// ── SECTIONS ──────────────────────────────────────────────────────────────
function renderSections() {
  const filterClassId = document.getElementById("sectionFilter")?.value || "";
  const list = filterClassId
    ? sections.filter(s => String(s.classId?._id || s.classId) === filterClassId)
    : sections;
  const grid = document.getElementById("sectionGrid");
  if (!list.length) { grid.innerHTML = `<p style="color:var(--muted)">No sections yet.</p>`; return; }
  grid.innerHTML = list.map(s => {
    const cls = s.classId?.className || "—";
    return `
      <div class="item-card">
        <h4>Section ${s.sectionName}</h4>
        <p>${cls}</p>
        <div>
          <button class="act del-btn" onclick="deleteSection('${s._id}')">🗑️ Remove</button>
        </div>
      </div>`;
  }).join("");
}

// ── ANALYTICS TAB ─────────────────────────────────────────────────────────
function renderAnalyticsTab(a) {
  const grid = document.getElementById("analyticsGrid");
  if (!grid) return;
  grid.innerHTML = `
    <div class="stat teal"><span>🏴</span><p class="sv">${a.teachers}</p><p class="sl">Teachers</p></div>
    <div class="stat blue"><span>⚓</span><p class="sv">${a.students}</p><p class="sl">Students</p></div>
    <div class="stat gold"><span>🗝️</span><p class="sv">${a.classes}</p><p class="sl">Classes</p></div>
    <div class="stat green"><span>🧭</span><p class="sv">${a.sections}</p><p class="sl">Sections</p></div>
    <div class="stat red"><span>🚫</span><p class="sv">${a.blocked}</p><p class="sl">Blocked</p></div>
    <div class="stat amber"><span>⏳</span><p class="sv">${a.firstLogin}</p><p class="sl">Pending Setup</p></div>
  `;
}

// ── POPULATE SELECTS ──────────────────────────────────────────────────────
function populateClassSelects() {
  ["s-class","c-name-skip","as-class","sec-class"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = `<option value="">Select class</option>` +
      classes.map(c => `<option value="${c._id}">${c.className}</option>`).join("");
  });
}

function populateSectionFilter() {
  const el = document.getElementById("sectionFilter");
  if (!el) return;
  el.innerHTML = `<option value="">All Classes</option>` +
    classes.map(c => `<option value="${c._id}">${c.className}</option>`).join("");
}

window.populateSectionSelect = function (classSelectId, sectionSelectId) {
  const classId  = document.getElementById(classSelectId)?.value;
  const secEl    = document.getElementById(sectionSelectId);
  if (!secEl) return;
  const filtered = sections.filter(s => String(s.classId?._id || s.classId) === classId);
  secEl.innerHTML = `<option value="">Select section</option>` +
    filtered.map(s => `<option value="${s._id}">Section ${s.sectionName}</option>`).join("");
};

// ── MODAL CONTROL ─────────────────────────────────────────────────────────
function openModal(name) {
  // Reset result boxes
  ["s-result","t-result","adm-result","sch-result","reset-result"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.display = "none"; el.innerHTML = ""; }
  });
  document.getElementById("overlay").classList.add("open");
  document.getElementById(`modal-${name}`)?.classList.add("open");
  // Populate dynamic selects for modals that need class lists
  if (name === "addStudent") populateClassSelects();
  if (name === "addSection") populateClassSelects();
  if (name === "assignStudent") populateClassSelects();
}

function closeModal() {
  document.querySelectorAll(".modal.open").forEach(m => m.classList.remove("open"));
  document.getElementById("overlay").classList.remove("open");
  _assigningUserId = null;
  _resetUserId     = null;
}

function openAssignModal(userId) {
  _assigningUserId = userId;
  openModal("assignStudent");
}

function openResetModal(userId, name) {
  _resetUserId = userId;
  document.getElementById("resetPwdMsg").textContent =
    `Reset password for "${name}"? A new temporary password will be generated. They'll be forced to change it on next login.`;
  document.getElementById("reset-result").style.display = "none";
  openModal("resetPwd");
}

// ── ACTIONS ───────────────────────────────────────────────────────────────
async function createStudent() {
  const username  = document.getElementById("s-name").value.trim();
  const email     = document.getElementById("s-email").value.trim();
  const classId   = document.getElementById("s-class").value;
  const sectionId = document.getElementById("s-section").value;
  if (!username || !email) { toast("Name and email required", "error"); return; }
  try {
    const data = await api("/api/admin/create-student", "POST", { username, email, classId, sectionId });
    const box  = document.getElementById("s-result");
    box.style.display = "block";
    box.innerHTML = `
      <strong>✅ Student created</strong><br>
      Enrollment: <strong>${data.enrollmentNumber}</strong><br>
      Temp password: <strong>${data.tempPassword}</strong>
      <small>Share this securely. Student must change it on first login.</small>`;
    await loadUsers();
    renderStudents();
    toast("Student created");
  } catch (e) { toast(e.message, "error"); }
}

async function createTeacher() {
  const username = document.getElementById("t-name").value.trim();
  const email    = document.getElementById("t-email").value.trim();
  const subjects = document.getElementById("t-subjects").value.split(",").map(s => s.trim()).filter(Boolean);
  if (!username || !email) { toast("Name and email required", "error"); return; }
  try {
    const data = await api("/api/admin/create-teacher", "POST", { username, email, subjectsAssigned: subjects });
    const box  = document.getElementById("t-result");
    box.style.display = "block";
    box.innerHTML = `
      <strong>✅ Teacher created</strong><br>
      Employee ID: <strong>${data.employeeId}</strong><br>
      Temp password: <strong>${data.tempPassword}</strong>
      <small>Share this securely. Teacher must change it on first login.</small>`;
    await loadUsers();
    renderTeachers();
    toast("Teacher created");
  } catch (e) { toast(e.message, "error"); }
}

async function createClass() {
  const className = document.getElementById("c-name").value;
  if (!className) { toast("Select a class", "error"); return; }
  try {
    await api("/api/admin/classes", "POST", { className });
    await loadClasses();
    renderClasses();
    toast(`${className} created`);
    closeModal();
  } catch (e) { toast(e.message, "error"); }
}

async function createSection() {
  const classId     = document.getElementById("sec-class").value;
  const sectionName = document.getElementById("sec-name").value.trim().toUpperCase();
  if (!classId || !sectionName) { toast("Select class and enter section name", "error"); return; }
  try {
    await api("/api/admin/sections", "POST", { classId, sectionName });
    await loadSections();
    renderSections();
    toast(`Section ${sectionName} created`);
    closeModal();
  } catch (e) { toast(e.message, "error"); }
}

async function saveAssignment() {
  const classId   = document.getElementById("as-class").value;
  const sectionId = document.getElementById("as-section").value;
  if (!_assigningUserId) return;
  try {
    await api(`/api/admin/assign-student/${_assigningUserId}`, "PATCH", { classId, sectionId });
    await loadUsers();
    renderStudents();
    toast("Assignment saved");
    closeModal();
  } catch (e) { toast(e.message, "error"); }
}

window.confirmReset = async function () {
  if (!_resetUserId) return;
  try {
    const data = await api(`/api/admin/reset-password/${_resetUserId}`, "PATCH");
    const box  = document.getElementById("reset-result");
    box.style.display = "block";
    box.innerHTML = `<strong>🔑 New temp password:</strong> <strong>${data.tempPassword}</strong><small>User must change this on next login.</small>`;
    toast("Password reset");
  } catch (e) { toast(e.message, "error"); }
};

async function toggleBlock(userId, block) {
  try {
    const path = block ? `/api/admin/block/${userId}` : `/api/admin/unblock/${userId}`;
    const data = await api(path, "PATCH");
    await loadUsers();
    renderTeachers();
    renderStudents();
    toast(data.message);
  } catch (e) { toast(e.message, "error"); }
}

async function deactivate(userId, name) {
  if (!confirm(`Deactivate "${name}"? This is a soft delete — isActive will be set to false.`)) return;
  try {
    await api(`/api/admin/deactivate/${userId}`, "DELETE");
    await loadUsers();
    renderTeachers();
    renderStudents();
    toast(`${name} deactivated`);
  } catch (e) { toast(e.message, "error"); }
}

async function deleteClass(id, name) {
  if (!confirm(`Remove "${name}" and all its sections?`)) return;
  try {
    await api(`/api/admin/classes/${id}`, "DELETE");
    await loadClasses();
    await loadSections();
    renderClasses();
    toast(`${name} removed`, "warn");
  } catch (e) { toast(e.message, "error"); }
}

async function deleteSection(id) {
  if (!confirm("Remove this section?")) return;
  try {
    await api(`/api/admin/sections/${id}`, "DELETE");
    await loadSections();
    renderSections();
    toast("Section removed", "warn");
  } catch (e) { toast(e.message, "error"); }
}

// ── TOAST ─────────────────────────────────────────────────────────────────
function toast(msg, type = "success") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className   = `toast ${type} show`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 3000);
}

// ── LOGOUT ────────────────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}
