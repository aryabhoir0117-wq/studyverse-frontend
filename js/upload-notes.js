const BASE_URL = "https://studyverse-backend-28sn.onrender.com";
const token    = localStorage.getItem("token");
 
const activeClassId     = localStorage.getItem("activeClassId");
const activeClassname   = localStorage.getItem("activeClassname");
const activeSectionId   = localStorage.getItem("activeSectionId");
const activeSectionName = localStorage.getItem("activeSectionName");
const activeSubjects    = JSON.parse(localStorage.getItem("activeSubjects") || "[]");
 
if (!token || !activeClassId) window.location.href = "teacher-picker.html";
 
document.getElementById("ctxClass").textContent   = activeClassname   || "—";
document.getElementById("ctxSection").textContent = "Sec " + (activeSectionName || "—");
 
// ── SUBJECTS ─────────────────────────────────────────────────────────────
function populateSubjects() {
  const sel = document.getElementById("notesSubject");
  sel.innerHTML = '<option value="">— select subject —</option>';
  activeSubjects.forEach(s => {
    const o = document.createElement("option");
    o.value = s; o.textContent = s;
    sel.appendChild(o);
  });
  const filterSub = document.getElementById("filterSubject");
  filterSub.innerHTML = '<option value="">All Subjects</option>';
  activeSubjects.forEach(s => {
    const o = document.createElement("option");
    o.value = s; o.textContent = s;
    filterSub.appendChild(o);
  });
}
populateSubjects();
 
// ── TABS ──────────────────────────────────────────────────────────────────
function switchTab(id, btn) {
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("panel-" + id).classList.add("active");
  btn.classList.add("active");
}
 
// ── DATE ──────────────────────────────────────────────────────────────────
function setToday() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2,"0");
  const mm = String(d.getMonth()+1).padStart(2,"0");
  document.getElementById("notesDate").value = `${dd}/${mm}/${d.getFullYear()}`;
}
setToday(); // auto-fill on load
 
// ── FILE DRAG/DROP ────────────────────────────────────────────────────────
const dropZone = document.getElementById("dropZone");
dropZone.addEventListener("dragover",  e => { e.preventDefault(); dropZone.classList.add("drag-over"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file && file.type === "application/pdf") {
    document.getElementById("pdfInput").files = e.dataTransfer.files;
    onFileChange({ files: e.dataTransfer.files });
  }
});
function onFileChange(input) {
  const file = input.files[0];
  const fn = document.getElementById("fileName");
  if (file) { fn.textContent = "📄 " + file.name; fn.style.display = "block"; }
}
 
// ── SECTION BROADCASTER ───────────────────────────────────────────────────
let allSections = [];
let selectedSections = new Set();
 
async function loadSections() {
  try {
    const res = await fetch(`${BASE_URL}/api/teacher/my-profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    const profile = await res.json();
 
    const seen = new Set();
    profile.assignments
      .filter(a => (a.classId?._id || a.classId) === activeClassId)
      .forEach(a => {
        const sid   = a.sectionId?._id  || a.sectionId;
        const sname = a.sectionId?.sectionName || "—";
        if (!seen.has(sid)) { seen.add(sid); allSections.push({ _id: sid, sectionName: sname }); }
      });
 
    renderSectionGrid();
 
    // Filter dropdown
    const sel = document.getElementById("filterSection");
    sel.innerHTML = '<option value="">All Sections</option>';
    allSections.forEach(s => {
      const o = document.createElement("option");
      o.value = s._id; o.textContent = "Section " + s.sectionName;
      sel.appendChild(o);
    });
 
    if (activeSectionId) { selectedSections.add(activeSectionId); updateSectionUI(); }
  } catch {
    document.getElementById("sectionGrid").innerHTML =
      '<div style="color:#f87171;font-size:12px;grid-column:1/-1;">Could not load sections.</div>';
  }
}
 
function renderSectionGrid() {
  const grid = document.getElementById("sectionGrid");
  if (!allSections.length) {
    grid.innerHTML = '<div style="color:#4a7a99;font-size:12px;grid-column:1/-1;">No sections found.</div>';
    return;
  }
  grid.innerHTML = allSections.map(s => `
    <div class="sec-toggle" data-id="${s._id}" onclick="toggleSection('${s._id}')">
      <span class="check">✓</span>
      <span>Sec ${s.sectionName}</span>
    </div>
  `).join("");
}
 
function toggleSection(id) {
  if (selectedSections.has(id)) selectedSections.delete(id);
  else selectedSections.add(id);
  updateSectionUI();
}
function toggleSelectAll() {
  if (selectedSections.size === allSections.length) selectedSections.clear();
  else allSections.forEach(s => selectedSections.add(s._id));
  updateSectionUI();
}
function updateSectionUI() {
  document.querySelectorAll(".sec-toggle").forEach(el => {
    el.classList.toggle("active", selectedSections.has(el.dataset.id));
  });
  document.getElementById("selectedCount").textContent =
    `${selectedSections.size} of ${allSections.length} selected`;
}
 
// ── COMMON FIELD GETTER ───────────────────────────────────────────────────
function getCommonFields() {
  return {
    classId:    activeClassId,
    sectionIds: [...selectedSections],
    subject:    document.getElementById("notesSubject").value,
    title:      document.getElementById("notesTitle").value.trim(),
    date:       document.getElementById("notesDate").value
  };
}
 
// ── SAVE TEXT NOTES ───────────────────────────────────────────────────────
async function saveTextNotes() {
  const { classId, sectionIds, subject, title, date } = getCommonFields();
  const content = document.getElementById("notesContent").value.trim();
  const btn = document.getElementById("saveTextBtn");
 
  if (!subject)        { alert("Select a subject"); return; }
  if (!sectionIds.length) { alert("Select at least one section"); return; }
  if (!title)          { alert("Enter a title"); return; }
  if (!content)        { alert("Enter some content"); return; }
 
  btn.disabled = true; btn.textContent = "Uploading…";
 
  try {
    const res = await fetch(`${BASE_URL}/api/notes/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ classId, sectionIds, subject, title, content, date })
    });
    const data = await res.json();
 
    if (res.ok) {
      alert(`✅ Notes sent to ${data.notes?.length || 1} section(s)!`);
      document.getElementById("notesTitle").value   = "";
      document.getElementById("notesContent").value = "";
      loadMyNotes();
    } else {
      alert("❌ " + data.message);
    }
  } catch { alert("❌ Server error."); }
  btn.disabled = false; btn.textContent = "Upload Text Notes";
}
 
// ── UPLOAD PDF ────────────────────────────────────────────────────────────
async function uploadPDF() {
  const { classId, sectionIds, subject, title, date } = getCommonFields();
  const content = document.getElementById("notesContentPDF").value.trim();
  const pdfFile = document.getElementById("pdfInput").files[0];
  const status  = document.getElementById("uploadStatus");
  const btn     = document.getElementById("savePDFBtn");
 
  if (!subject)           { alert("Select a subject"); return; }
  if (!sectionIds.length) { alert("Select at least one section"); return; }
  if (!title)             { alert("Enter a title"); return; }
  if (!pdfFile)           { alert("Select a PDF file"); return; }
 
  btn.disabled = true; btn.textContent = "Uploading…";
  status.textContent = "Uploading PDF to cloud…";
 
  const formData = new FormData();
  formData.append("pdf", pdfFile);
  formData.append("classId", classId);
  sectionIds.forEach(sid => formData.append("sectionIds[]", sid));
  formData.append("subject", subject);
  formData.append("title", title);
  if (content) formData.append("content", content);
  formData.append("date", date);
 
  try {
    const res  = await fetch(`${BASE_URL}/api/notes/upload-pdf`, {
      method:  "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body:    formData
    });
    const data = await res.json();
 
    if (res.ok) {
      status.textContent = `✅ PDF sent to ${data.notes?.length || 1} section(s)!`;
      document.getElementById("notesTitle").value      = "";
      document.getElementById("notesContentPDF").value = "";
      document.getElementById("pdfInput").value        = "";
      document.getElementById("fileName").style.display = "none";
      loadMyNotes();
    } else {
      status.textContent = "❌ " + data.message;
    }
  } catch { status.textContent = "❌ Server error."; }
  btn.disabled = false; btn.textContent = "Upload PDF Notes";
}
 
// ── LOAD NOTES TABLE ──────────────────────────────────────────────────────
async function loadMyNotes() {
  const tbody     = document.getElementById("notesTableBody");
  const secFilter = document.getElementById("filterSection").value;
  const subFilter = document.getElementById("filterSubject").value;
 
  tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Loading…</td></tr>';
 
  let url = `${BASE_URL}/api/notes/my-notes?classId=${activeClassId}`;
  if (secFilter) url += `&sectionId=${secFilter}`;
  if (subFilter) url += `&subject=${encodeURIComponent(subFilter)}`;
 
  try {
    const res   = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
    const notes = await res.json();
 
    if (!notes.length) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No notes yet. Upload one above ☝</td></tr>';
      return;
    }
 
    tbody.innerHTML = notes.map(n => `
      <tr>
        <td><strong style="color:#e2f0f7;">${n.title}</strong></td>
        <td><span class="badge badge-subject">${n.subject}</span></td>
        <td><span class="badge badge-section">Sec ${n.sectionId?.sectionName || "—"}</span></td>
        <td style="font-size:12px;color:#7aa8cc;">${n.date || "—"}</td>
        <td>
          ${n.pdfUrl
            ? `<span class="badge badge-pdf" onclick="viewPDF('${n.pdfUrl}')">📎 View PDF</span>`
            : '<span style="color:#4a7a99;font-size:12px;">Text only</span>'}
        </td>
        <td>
          <button class="btn-edit" onclick="editNote('${n._id}','${escapeQ(n.title)}','${escapeQ(n.content)}','${n.date||''}')">Edit</button>
          <button class="btn-del"  onclick="deleteNote('${n._id}')">Delete</button>
        </td>
      </tr>
    `).join("");
  } catch {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6" style="color:#f87171;">Failed to load notes.</td></tr>';
  }
}
 
const escapeQ = s => (s || "").replace(/'/g, "\\'").replace(/\n/g, " ").substring(0, 80);
 
function viewPDF(url) {
  window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`, "_blank");
}
 
// ── EDIT / DELETE ─────────────────────────────────────────────────────────
function editNote(id, title, content, date) {
  const t = prompt("Edit Title:", title);   if (!t) return;
  const c = prompt("Edit Content:", content); if (!c) return;
  const d = prompt("Edit Date:", date);
  updateNote(id, t, c, d);
}
async function updateNote(id, title, content, date) {
  try {
    const res = await fetch(`${BASE_URL}/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ title, content, date })
    });
    const data = await res.json();
    if (res.ok) { alert("Updated!"); loadMyNotes(); }
    else alert(data.message);
  } catch { alert("Server error."); }
}
async function deleteNote(id) {
  if (!confirm("Delete this note?")) return;
  try {
    const res = await fetch(`${BASE_URL}/api/notes/${id}`, {
      method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
    });
    if ((await res.json()).message) loadMyNotes();
  } catch { alert("Server error."); }
}
 
function switchClass() {
  ["activeClassId","activeClassname","activeSectionId","activeSectionName","activeSubjects"]
    .forEach(k => localStorage.removeItem(k));
  window.location.href = "teacher-picker.html";
}
 
// ── INIT ──────────────────────────────────────────────────────────────────
loadSections();
loadMyNotes();