const BASE_URL = "https://studyverse-backend-28sn.onrender.com";

let allNotes   = [];
let activeUnit = null;

document.addEventListener("DOMContentLoaded", async () => {

  const subject = localStorage.getItem("notesSubject");
  const token   = localStorage.getItem("token");
  const titleEl = document.getElementById("notesTitle");
  const tbody   = document.getElementById("notesTableBody");

  if (titleEl) titleEl.textContent = subject ? subject.toUpperCase() + " Notes" : "Notes";

  // Fetch all notes for subject (no unit filter — we'll tab on frontend)
  try {
    const response = await fetch(`${BASE_URL}/api/notes/subject/${subject}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    allNotes = await response.json();

    if (!allNotes.length) {
      renderEmptyState(tbody);
      return;
    }

    // Build unit tabs
    const units = [...new Set(allNotes.map(n => n.unit))].sort();
    renderUnitTabs(units, subject);

    // Show first unit by default
    activeUnit = units[0];
    renderNotes(activeUnit, tbody);

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="padding:20px;color:#ef4444;">Could not load notes.</td></tr>`;
    console.error(err);
  }
});

function renderUnitTabs(units, subject) {
  // Insert tab bar above table
  const container = document.querySelector(".main-area") || document.body;
  const tbody     = document.getElementById("notesTableBody");

  const existingTabs = document.getElementById("unitTabBar");
  if (existingTabs) existingTabs.remove();

  const tabBar = document.createElement("div");
  tabBar.id = "unitTabBar";
  tabBar.style.cssText = `
    display: flex; gap: 10px; flex-wrap: wrap;
    padding: 0 0 20px 0; margin-bottom: 4px;
  `;

  units.forEach(unit => {
    const btn = document.createElement("button");
    btn.textContent = unit;
    btn.dataset.unit = unit;
    btn.className = "unit-tab-btn" + (unit === activeUnit ? " active" : "");
    btn.style.cssText = `
      padding: 8px 20px;
      font-family: 'Cinzel', serif;
      font-size: 11px; letter-spacing: 1.5px;
      text-transform: uppercase;
      border-radius: 8px; cursor: pointer;
      transition: all 0.2s ease;
      background: ${unit === activeUnit ? "#f5c842" : "rgba(255,209,102,0.08)"};
      color: ${unit === activeUnit ? "#0a1628" : "#f5c842"};
      border: 1px solid ${unit === activeUnit ? "#f5c842" : "rgba(255,209,102,0.3)"};
    `;

    btn.onclick = () => {
      activeUnit = unit;
      document.querySelectorAll(".unit-tab-btn").forEach(b => {
        const isActive = b.dataset.unit === unit;
        b.style.background = isActive ? "#f5c842" : "rgba(255,209,102,0.08)";
        b.style.color       = isActive ? "#0a1628" : "#f5c842";
        b.style.border      = `1px solid ${isActive ? "#f5c842" : "rgba(255,209,102,0.3)"}`;
      });
      renderNotes(unit, document.getElementById("notesTableBody"));
    };

    tabBar.appendChild(btn);
  });

  // Insert tab bar before the table wrapper
  const tableWrapper = document.querySelector(".table-wrapper") || tbody.closest("div");
  if (tableWrapper && tableWrapper.parentNode) {
    tableWrapper.parentNode.insertBefore(tabBar, tableWrapper);
  }
}

function renderNotes(unit, tbody) {
  const filtered = allNotes.filter(n => n.unit === unit);

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="padding:20px;color:#94a3b8;">No notes for ${unit} yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(note => `
    <tr style="border-bottom:1px solid #334155;">
      <td style="padding:12px;color:white;">${note.title}</td>
      <td style="padding:12px;color:#94a3b8;">${note.subject}</td>
      <td style="padding:12px;color:#94a3b8;">${note.date || "-"}</td>
      <td style="padding:12px;color:#94a3b8;">
        <span id="preview-${note._id}">${note.content.substring(0, 60)}...</span>
        <span id="full-${note._id}" style="display:none;">${note.content}</span>
        <button onclick="toggleContent('${note._id}')"
          style="background:none;border:none;color:#facc15;cursor:pointer;font-size:12px;margin-left:5px;">
          Read More
        </button>
      </td>
      <td style="padding:12px;display:flex;gap:10px;">
        ${note.pdfUrl ? `
          <button onclick="viewPDF('${note.pdfUrl}')"
            style="background:#1e293b;border:1px solid #334155;color:white;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:16px;" title="View PDF">👁</button>
          <a href="https://docs.google.com/viewer?url=${encodeURIComponent(note.pdfUrl)}&embedded=false" target="_blank"
            style="background:#facc15;color:black;padding:6px 12px;border-radius:6px;font-weight:bold;text-decoration:none;font-size:16px;" title="Download PDF">⬇</a>
        ` : "<span style='color:#94a3b8;'>No PDF</span>"}
      </td>
    </tr>
  `).join("");
}

function renderEmptyState(tbody) {
  tbody.innerHTML = `<tr><td colspan="5" style="padding:20px;color:#94a3b8;">No notes uploaded by teacher yet.</td></tr>`;
}

function viewPDF(pdfUrl) {
  const googleViewer = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  const viewer = document.getElementById("pdfViewer");
  const frame  = document.getElementById("pdfFrame");
  frame.src    = googleViewer;
  viewer.style.display = "block";
  viewer.scrollIntoView({ behavior: "smooth" });
}

function toggleContent(id) {
  const preview = document.getElementById(`preview-${id}`);
  const full    = document.getElementById(`full-${id}`);
  const btn     = event.target;

  if (full.style.display === "none") {
    full.style.display    = "inline";
    preview.style.display = "none";
    btn.textContent       = "Read Less";
  } else {
    full.style.display    = "none";
    preview.style.display = "inline";
    btn.textContent       = "Read More";
  }
}