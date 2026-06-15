const BASE_URL = "https://studyverse-backend-28sn.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {

  const subject = localStorage.getItem("notesSubject");
  const token = localStorage.getItem("token");
  const title = document.getElementById("notesTitle");
  const tbody = document.getElementById("notesTableBody");

  if (title) title.textContent = subject.toUpperCase() + " Notes";

  try {
    const response = await fetch(`${BASE_URL}/api/notes/subject/${subject}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const notes = await response.json();

    if (!notes.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="padding:20px;color:#94a3b8;">No notes uploaded by teacher yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = notes.map(note => `
      <tr style="border-bottom:1px solid #334155;">
        <td style="padding:12px;color:white;">${note.title}</td>
        <td style="padding:12px;color:#94a3b8;">${note.subject}</td>
        <td style="padding:12px;color:#94a3b8;">${note.date || "-"}</td>
        <td style="padding:12px;color:#94a3b8;">
  <span id="preview-${note._id}">${note.content.substring(0, 60)}...</span>
  <span id="full-${note._id}" style="display:none;">${note.content}</span>
  <button onclick="toggleContent('${note._id}')" style="background:none;border:none;color:#facc15;cursor:pointer;font-size:12px;margin-left:5px;">Read More</button>
</td>       
 <td style="padding:12px;display:flex;gap:10px;">
          ${note.pdfUrl ? `
            <button onclick="viewPDF('${note.pdfUrl}')" 
              style="background:#1e293b;border:1px solid #334155;color:white;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:16px;" title="View PDF">👁</button>
<a href="https://docs.google.com/viewer?url=${encodeURIComponent(note.pdfUrl)}&embedded=false" target="_blank"
  style="background:#facc15;color:black;padding:6px 12px;border-radius:6px;font-weight:bold;text-decoration:none;font-size:16px;" title="Download PDF">⬇</a>          ` : "<span style='color:#94a3b8;'>No PDF</span>"}
        </td>
      </tr>
    `).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="padding:20px;color:#ef4444;">Could not load notes.</td></tr>`;
    console.error(err);
  }

});

function viewPDF(pdfUrl) {
  const googleViewer = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  const viewer = document.getElementById("pdfViewer");
  const frame = document.getElementById("pdfFrame");
  frame.src = googleViewer;
  viewer.style.display = "block";
  viewer.scrollIntoView({ behavior: "smooth" });
}
function toggleContent(id) {
  const preview = document.getElementById(`preview-${id}`);
  const full = document.getElementById(`full-${id}`);
  const btn = event.target;

  if (full.style.display === "none") {
    full.style.display = "inline";
    preview.style.display = "none";
    btn.textContent = "Read Less";
  } else {
    full.style.display = "none";
    preview.style.display = "inline";
    btn.textContent = "Read More";
  }
}