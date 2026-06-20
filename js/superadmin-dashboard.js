const API = "https://studyverse-backend-28sn.onrender.com";

let allSchools = [];
let allAdmins  = [];
const token = localStorage.getItem("token");
const user  = JSON.parse(localStorage.getItem("user") || "{}");

// ── AUTH GUARD ────────────────────────────────────────────────────────────
if (!token || user.role !== "superadmin") {
  window.location.href = "login.html";
}

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("saName").textContent    = user.username || "SuperAdmin";
  document.getElementById("saInitials").textContent = (user.username || "S")[0].toUpperCase();
  await Promise.all([loadAnalytics(), loadSchools(), loadAdmins()]);
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
async function loadAnalytics() {
  try {
    const a = await api("/api/superadmin/analytics");
    document.getElementById("sa-schools").textContent  = a.schools;
    document.getElementById("sa-admins").textContent   = a.admins;
    document.getElementById("sa-teachers").textContent = a.teachers;
    document.getElementById("sa-students").textContent = a.students;
    document.getElementById("sa-blocked").textContent  = a.blocked;
    renderAnalyticsTab(a);
  } catch (e) { toast(e.message, "error"); }
}

async function loadSchools() {
  try {
    allSchools = await api("/api/superadmin/schools");
    renderSchools();
    populateSchoolSelects();
  } catch (e) { toast(e.message, "error"); }
}

async function loadAdmins() {
  try {
    allAdmins = await api("/api/superadmin/admins");
    renderAdmins();
  } catch (e) { toast(e.message, "error"); }
}

// ── RENDER ────────────────────────────────────────────────────────────────
function renderSchools() {
  const q = (document.getElementById("schoolSearch")?.value || "").toLowerCase();
  const list = allSchools.filter(s => s.schoolName.toLowerCase().includes(q));
  const tbody = document.getElementById("schoolTbody");
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:24px">No schools yet</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(s => `
    <tr>
      <td><strong>${s.schoolName}</strong></td>
      <td style="color:var(--muted)">${s.board || "—"}</td>
      <td>${s.admins}</td>
      <td>${s.teachers}</td>
      <td>${s.students}</td>
      <td>
        <button class="act" onclick="openAddAdminForSchool('${s._id}','${s.schoolName}')">👑 Add Admin</button>
        <button class="act del-btn" onclick="deactivateSchool('${s._id}','${s.schoolName}')">🗑️</button>
      </td>
    </tr>`).join("");
}

function renderAdmins() {
  const q = (document.getElementById("adminSearch")?.value || "").toLowerCase();
  const list = allAdmins.filter(a =>
    a.username.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
  );
  const tbody = document.getElementById("adminTbody");
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px">No admins yet</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(a => `
    <tr>
      <td><strong>${a.username}</strong></td>
      <td style="color:var(--muted)">${a.email}</td>
      <td>${a.schoolId?.schoolName || "—"}</td>
      <td>
        ${a.isBlocked
          ? '<span class="badge badge-blocked">Blocked</span>'
          : '<span class="badge badge-active">Active</span>'}
        ${a.isFirstLogin ? '<span class="badge badge-pending" style="margin-left:4px">Pending</span>' : ""}
      </td>
      <td>
        ${a.isBlocked
          ? `<button class="act unblock-btn" onclick="toggleAdmin('${a._id}',false)">✅ Unblock</button>`
          : `<button class="act block-btn"   onclick="toggleAdmin('${a._id}',true)">🚫 Block</button>`}
      </td>
    </tr>`).join("");
}

function renderAnalyticsTab(a) {
  const grid = document.getElementById("saAnalyticsGrid");
  if (!grid) return;
  grid.innerHTML = `
    <div class="stat gold"><span>🏫</span><p class="sv">${a.schools}</p><p class="sl">Schools</p></div>
    <div class="stat red"><span>👑</span><p class="sv">${a.admins}</p><p class="sl">School Admins</p></div>
    <div class="stat teal"><span>🏴</span><p class="sv">${a.teachers}</p><p class="sl">Teachers</p></div>
    <div class="stat blue"><span>⚓</span><p class="sv">${a.students}</p><p class="sl">Students</p></div>
    <div class="stat amber"><span>🚫</span><p class="sv">${a.blocked}</p><p class="sl">Blocked</p></div>
  `;
}

// ── SELECTS ───────────────────────────────────────────────────────────────
function populateSchoolSelects() {
  const el = document.getElementById("adm-school");
  if (!el) return;
  el.innerHTML = `<option value="">Select school</option>` +
    allSchools.map(s => `<option value="${s._id}">${s.schoolName}</option>`).join("");
}

// ── TAB SWITCHING ─────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(`tab-${name}`)?.classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b => {
    if (b.textContent.toLowerCase().includes(name.slice(0, 5))) b.classList.add("active");
  });
  document.getElementById("tabTitle").textContent = {
    overview: "Platform Overview", schools: "Schools",
    admins: "School Admins", analytics: "Analytics"
  }[name] || name;
}

// ── MODAL ─────────────────────────────────────────────────────────────────
function openModal(name) {
  ["sch-result","adm-result"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.display = "none"; el.innerHTML = ""; }
  });
  document.getElementById("overlay").classList.add("open");
  document.getElementById(`modal-${name}`)?.classList.add("open");
  if (name === "addAdmin") populateSchoolSelects();
}

function closeModal() {
  document.querySelectorAll(".modal.open").forEach(m => m.classList.remove("open"));
  document.getElementById("overlay").classList.remove("open");
}

function openAddAdminForSchool(schoolId, schoolName) {
  openModal("addAdmin");
  const sel = document.getElementById("adm-school");
  if (sel) sel.value = schoolId;
}

// ── ACTIONS ───────────────────────────────────────────────────────────────
async function createSchool() {
  const schoolName = document.getElementById("sch-name").value.trim();
  const board      = document.getElementById("sch-board").value;
  if (!schoolName) { toast("School name required", "error"); return; }
  try {
    const data = await api("/api/superadmin/schools", "POST", { schoolName, board });
    const box  = document.getElementById("sch-result");
    box.style.display = "block";
    box.innerHTML = `<strong>✅ School created</strong><br>ID: <strong>${data.school._id}</strong><small>Now add an admin for this school.</small>`;
    await loadSchools();
    toast(`${schoolName} created`);
  } catch (e) { toast(e.message, "error"); }
}

async function createAdmin() {
  const username = document.getElementById("adm-name").value.trim();
  const email    = document.getElementById("adm-email").value.trim();
  const schoolId = document.getElementById("adm-school").value;
  if (!username || !email || !schoolId) { toast("All fields required", "error"); return; }
  try {
    const data = await api("/api/superadmin/create-admin", "POST", { username, email, schoolId });
    const box  = document.getElementById("adm-result");
    box.style.display = "block";
    box.innerHTML = `
      <strong>✅ Admin created</strong><br>
      School: <strong>${data.school.schoolName}</strong><br>
      Temp password: <strong>${data.tempPassword}</strong>
      <small>Share this securely. Admin must change it on first login.</small>`;
    await loadAdmins();
    toast("Admin created");
  } catch (e) { toast(e.message, "error"); }
}

async function toggleAdmin(id, block) {
  try {
    const path = block ? `/api/superadmin/block-admin/${id}` : `/api/superadmin/unblock-admin/${id}`;
    const data = await api(path, "PATCH");
    await loadAdmins();
    toast(data.message);
  } catch (e) { toast(e.message, "error"); }
}

async function deactivateSchool(id, name) {
  if (!confirm(`Deactivate "${name}"? All users in this school will lose access.`)) return;
  try {
    await api(`/api/superadmin/schools/${id}`, "DELETE");
    await loadSchools();
    toast(`${name} deactivated`, "warn");
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
