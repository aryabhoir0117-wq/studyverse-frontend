const BASE_URL = "https://studyverse-backend-28sn.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {

  const subject  = localStorage.getItem("notesSubject") || "";
  const token    = localStorage.getItem("token");
  const titleEl  = document.getElementById("notesTitle");
  const tbody    = document.getElementById("notesTableBody");
  const emptyEl  = document.getElementById("emptyState");

  if (!token) { window.location.href = "login.html"; return; }
  if (titleEl) titleEl.textContent = subject.toUpperCase() + " — Notes";

  // Breadcrumb subject tag
  const subTag = document.getElementById("subjectTag");
  if (subTag) subTag.textContent = subject.toUpperCase();

  try {
    // ✅ CORRECT ROUTE: /api/notes/student?subject=...
    const url = `${BASE_URL}/api/notes/student?subject=${encodeURIComponent(subject)}`;
    const res = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const notes = await res.json();

    if (!Array.isArray(notes) || !notes.length) {
      if (tbody) tbody.innerHTML = "";
      if (emptyEl) emptyEl.style.display = "block";
      return;
    }

    if (emptyEl) emptyEl.style.display = "none";

    tbody.innerHTML = notes.map(note => `
      <tr class="note-row">
        <td class="note-title-cell">
          <div class="note-title">${note.title}</div>
          <div class="note-meta">${note.date || "—"}</div>
        </td>
        <td class="note-content-cell">
          <div class="note-preview" id="preview-${note._id}">
            ${note.content ? note.content.substring(0, 100) + (note.content.length > 100 ? "…" : "") : "<em style='opacity:.5'>No text content</em>"}
          </div>
          <div class="note-full" id="full-${note._id}" style="display:none;">
            ${note.content || ""}
          </div>
          ${note.content && note.content.length > 100
            ? `<button class="btn-read-more" onclick="toggleContent('${note._id}', this)">Read more</button>`
            : ""}
        </td>
        <td class="note-actions-cell">
          ${note.pdfUrl ? `
            <button class="action-btn view-btn" onclick="viewPDF('${note.pdfUrl}', '${note._id}')">
              <span>👁</span> View
            </button>
            <a class="action-btn dl-btn"
               href="https://docs.google.com/viewer?url=${encodeURIComponent(note.pdfUrl)}&embedded=false"
               target="_blank">
              <span>⬇</span> Download
            </a>
          ` : '<span class="no-pdf">Text only</span>'}
        </td>
      </tr>
    `).join("");

  } catch (err) {
    if (tbody) tbody.innerHTML = `
      <tr><td colspan="3" class="error-cell">Could not load notes. Try refreshing.</td></tr>
    `;
    console.error(err);
  }
});

// ── INLINE PDF VIEWER ──────────────────────────────────────────────────────
function viewPDF(pdfUrl, noteId) {
  // Close any open viewer first
  document.querySelectorAll(".pdf-inline-viewer").forEach(el => {
    el.style.display = "none";
    el.querySelector("iframe").src = "";
  });

  // Find or create inline viewer for this note
  const row   = document.querySelector(`[data-note-id="${noteId}"]`);
  const viewer = document.getElementById("pdfViewer");
  const frame  = document.getElementById("pdfFrame");

  const googleViewer = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  frame.src = googleViewer;
  viewer.style.display = "block";
  viewer.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closePDF() {
  const viewer = document.getElementById("pdfViewer");
  const frame  = document.getElementById("pdfFrame");
  if (viewer) viewer.style.display = "none";
  if (frame)  frame.src = "";
}

// ── READ MORE TOGGLE ───────────────────────────────────────────────────────
function toggleContent(id, btn) {
  const preview = document.getElementById("preview-" + id);
  const full    = document.getElementById("full-"    + id);
  if (!preview || !full) return;

  const isCollapsed = full.style.display === "none";
  full.style.display    = isCollapsed ? "block" : "none";
  preview.style.display = isCollapsed ? "none"  : "block";
  btn.textContent       = isCollapsed ? "Read less" : "Read more";
}