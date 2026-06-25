const BASE_URL = "https://studyverse-backend-28sn.onrender.com";
const token    = localStorage.getItem("token");
 
// ── 1. BOOT: read active context from picker ─────────────────────────────
const activeClassId   = localStorage.getItem("activeClassId");
const activeClassname = localStorage.getItem("activeClassname");
const activeSectionId = localStorage.getItem("activeSectionId");
const activeSectionName = localStorage.getItem("activeSectionName");
const activeSubjects  = JSON.parse(localStorage.getItem("activeSubjects") || "[]");
 
if (!token || !activeClassId) {
  window.location.href = "teacher-picker.html";
}
 
// ── 2. FILL CONTEXT BANNER ───────────────────────────────────────────────
document.getElementById("ctxClass").textContent   = activeClassname   || "—";
document.getElementById("ctxSection").textContent = "Sec " + (activeSectionName || "—");
 
// ── 3. POPULATE SUBJECT DROPDOWN from active assignment ──────────────────
function populateSubjectDropdown() {
  const sel = document.getElementById("lessonSubject");
  sel.innerHTML = '<option value="">— select subject —</option>';
  activeSubjects.forEach(s => {
    const o = document.createElement("option");
    o.value = s; o.textContent = s;
    sel.appendChild(o);
  });
  // Also populate filter
  const filterSub = document.getElementById("filterSubject");
  filterSub.innerHTML = '<option value="">All Subjects</option>';
  activeSubjects.forEach(s => {
    const o = document.createElement("option");
    o.value = s; o.textContent = s;
    filterSub.appendChild(o);
  });
}
populateSubjectDropdown();
 
// ── 4. LOAD ALL SECTIONS for this class (from teacher profile) ────────────
let allSections = []; // [{_id, sectionName}]
let selectedSections = new Set();
 
async function loadSections() {
  try {
    const res = await fetch(`${BASE_URL}/api/teacher/my-profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    const profile = await res.json();
 
    // Get all unique sections for the active class
    const seen = new Set();
    profile.assignments
      .filter(a => (a.classId?._id || a.classId) === activeClassId)
      .forEach(a => {
        const sid   = a.sectionId?._id  || a.sectionId;
        const sname = a.sectionId?.sectionName || "—";
        if (!seen.has(sid)) {
          seen.add(sid);
          allSections.push({ _id: sid, sectionName: sname });
        }
      });
 
    renderSectionGrid();
    populateFilterSections();
 
    // Auto-select the current active section
    if (activeSectionId) {
      selectedSections.add(activeSectionId);
      updateSectionUI();
    }
  } catch {
    document.getElementById("sectionGrid").innerHTML =
      '<div style="color:#f87171;font-size:12px;grid-column:1/-1;">Could not load sections. Refresh and try again.</div>';
  }
}
 
function renderSectionGrid() {
  const grid = document.getElementById("sectionGrid");
  if (!allSections.length) {
    grid.innerHTML = '<div style="color:#4a7a99;font-size:12px;grid-column:1/-1;">No sections found for this class.</div>';
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
  if (selectedSections.size === allSections.length) {
    selectedSections.clear();
  } else {
    allSections.forEach(s => selectedSections.add(s._id));
  }
  updateSectionUI();
}
 
function updateSectionUI() {
  document.querySelectorAll(".sec-toggle").forEach(el => {
    const id = el.dataset.id;
    el.classList.toggle("active", selectedSections.has(id));
  });
  document.getElementById("selectedCount").textContent =
    `${selectedSections.size} of ${allSections.length} selected`;
}
 
function populateFilterSections() {
  const sel = document.getElementById("filterSection");
  sel.innerHTML = '<option value="">All Sections</option>';
  allSections.forEach(s => {
    const o = document.createElement("option");
    o.value = s._id; o.textContent = "Section " + s.sectionName;
    sel.appendChild(o);
  });
}
 
// ── 5. ANSWER PILLS ───────────────────────────────────────────────────────
function selectAnswer(val) {
  document.querySelectorAll(".answer-pill").forEach((p, i) => {
    p.classList.toggle("selected", i === val);
  });
  document.getElementById("answerIndex").value = val;
}
 
// ── 6. AI GENERATION ─────────────────────────────────────────────────────
async function generateWithAI() {
  const topic   = document.getElementById("topicInput").value.trim();
  const subject = document.getElementById("lessonSubject").value;
  const status  = document.getElementById("aiStatus");
  const btn     = document.getElementById("aiBtn");
 
  if (!topic)   { status.textContent = "⚠ Enter a topic first"; return; }
  if (!subject) { status.textContent = "⚠ Select a subject first"; return; }
 
  btn.disabled = true;
  status.textContent = "⚡ Generating…";
 
  try {
    const res = await fetch(`${BASE_URL}/api/lesson-ai/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ topic, subject })
    });
    const data = await res.json();
 
    if (res.ok) {
      document.getElementById("questionInput").value = data.question;
      document.getElementById("opt1").value = data.options[0];
      document.getElementById("opt2").value = data.options[1];
      document.getElementById("opt3").value = data.options[2];
      document.getElementById("opt4").value = data.options[3];
      selectAnswer(data.answer);
      status.textContent = "✅ Generated! Review and save.";
    } else {
      status.textContent = "❌ " + data.message;
    }
  } catch {
    status.textContent = "❌ Server error. Try again.";
  }
  btn.disabled = false;
}
 
// ── 7. SAVE LESSON ────────────────────────────────────────────────────────
async function saveLesson() {
  const subject  = document.getElementById("lessonSubject").value;
  const question = document.getElementById("questionInput").value.trim();
  const options  = [
    document.getElementById("opt1").value.trim(),
    document.getElementById("opt2").value.trim(),
    document.getElementById("opt3").value.trim(),
    document.getElementById("opt4").value.trim()
  ];
  const answer   = document.getElementById("answerIndex").value;
  const btn      = document.getElementById("saveBtn");
 
  if (!subject)                   { alert("Select a subject"); return; }
  if (!selectedSections.size)     { alert("Select at least one section"); return; }
  if (!question)                  { alert("Enter a question"); return; }
  if (options.some(o => !o))      { alert("Fill in all 4 options"); return; }
  if (answer === "")              { alert("Select the correct answer"); return; }
 
  btn.disabled = true;
  btn.textContent = "Saving…";
 
  try {
    const res = await fetch(`${BASE_URL}/api/lessons/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({
        classId:    activeClassId,
        sectionIds: [...selectedSections],
        subject, question, options,
        answer: Number(answer)
      })
    });
    const data = await res.json();
 
    if (res.ok) {
      const count = data.lessons?.length || 1;
      alert(`✅ Lesson broadcast to ${count} section(s)!`);
      // Reset form
      document.getElementById("questionInput").value = "";
      document.getElementById("opt1").value = "";
      document.getElementById("opt2").value = "";
      document.getElementById("opt3").value = "";
      document.getElementById("opt4").value = "";
      document.getElementById("answerIndex").value = "";
      document.getElementById("aiStatus").textContent = "";
      document.getElementById("topicInput").value = "";
      document.querySelectorAll(".answer-pill").forEach(p => p.classList.remove("selected"));
      loadMyLessons();
    } else {
      alert("❌ " + data.message);
    }
  } catch {
    alert("❌ Server error. Try again.");
  }
 
  btn.disabled = false;
  btn.textContent = "Save & Broadcast Lesson";
}
 
// ── 8. LOAD LESSONS TABLE ─────────────────────────────────────────────────
async function loadMyLessons() {
  const tbody    = document.getElementById("lessonsTableBody");
  const secFilter = document.getElementById("filterSection").value;
  const subFilter = document.getElementById("filterSubject").value;
 
  tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Loading…</td></tr>';
 
  let url = `${BASE_URL}/api/lessons/my/lessons?classId=${activeClassId}`;
  if (secFilter) url += `&sectionId=${secFilter}`;
  if (subFilter) url += `&subject=${encodeURIComponent(subFilter)}`;
 
  try {
    const res     = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
    const lessons = await res.json();
 
    if (!lessons.length) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No lessons yet. Create one above ☝</td></tr>';
      return;
    }
 
    tbody.innerHTML = lessons.map(l => `
      <tr>
        <td><span class="badge badge-subject">${l.subject}</span></td>
        <td><span class="badge badge-section">${l.sectionId?.sectionName || "—"}</span></td>
        <td style="max-width:260px;">${l.question}</td>
        <td><span class="badge badge-answer">${["A","B","C","D"][l.answer]}: ${l.options[l.answer]}</span></td>
        <td>
          <button class="btn-del" onclick="deleteLesson('${l._id}')">Delete</button>
        </td>
      </tr>
    `).join("");
  } catch {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5" style="color:#f87171;">Failed to load lessons.</td></tr>';
  }
}
 
// ── 9. DELETE LESSON ─────────────────────────────────────────────────────
async function deleteLesson(id) {
  if (!confirm("Delete this lesson?")) return;
  try {
    const res  = await fetch(`${BASE_URL}/api/lessons/${id}`, {
      method:  "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) { loadMyLessons(); }
    else alert(data.message);
  } catch { alert("Server error."); }
}
 
// ── 10. SWITCH CLASS ─────────────────────────────────────────────────────
function switchClass() {
  ["activeClassId","activeClassname","activeSectionId","activeSectionName","activeSubjects"]
    .forEach(k => localStorage.removeItem(k));
  window.location.href = "teacher-picker.html";
}
 
// ── INIT ─────────────────────────────────────────────────────────────────
loadSections();
loadMyLessons();