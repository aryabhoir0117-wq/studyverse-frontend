const BASE_URL = "https://studyverse-backend-28sn.onrender.com";

function setToday() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  document.getElementById("notesDate").value = `${dd}/${mm}/${yyyy}`;
}

async function saveNotes() {
  const subject = document.getElementById("notesSubject").value;
  const title = document.getElementById("notesTitle").value;
  const content = document.getElementById("notesContent").value;
  const date = document.getElementById("notesDate").value;
  const token = localStorage.getItem("token");

  if (!title || !content) {
    alert("Title and content are required");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/notes/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ subject, title, content, date })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Notes Uploaded Successfully!");
      document.getElementById("notesTitle").value = "";
      document.getElementById("notesContent").value = "";
      document.getElementById("notesDate").value = "";
      loadMyNotes();
    } else {
      alert(data.message);
    }

  } catch (err) {
    alert("Server error. Try again.");
    console.error(err);
  }
}

async function uploadPDF() {
  const subject = document.getElementById("notesSubject").value;
  const title = document.getElementById("notesTitle").value;
  const content = document.getElementById("notesContent").value;
  const date = document.getElementById("notesDate").value;
  const pdfFile = document.getElementById("pdfInput").files[0];
  const token = localStorage.getItem("token");

  if (!title || !content) {
    alert("Title and content are required");
    return;
  }

  if (!pdfFile) {
    alert("Please select a PDF file");
    return;
  }

  const formData = new FormData();
  formData.append("pdf", pdfFile);
  formData.append("subject", subject);
  formData.append("title", title);
  formData.append("content", content);
  formData.append("date", date);

  try {
    document.getElementById("uploadStatus").textContent = "Uploading...";

    const response = await fetch(`${BASE_URL}/api/notes/upload-pdf`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById("uploadStatus").textContent = "PDF Uploaded Successfully!";
      loadMyNotes();
    } else {
      document.getElementById("uploadStatus").textContent = data.message;
    }

  } catch (err) {
    document.getElementById("uploadStatus").textContent = "Server error.";
    console.error(err);
  }
}

async function loadMyNotes() {
  const token = localStorage.getItem("token");
  const tbody = document.getElementById("notesTableBody");

  try {
    const response = await fetch(`${BASE_URL}/api/notes/my-notes`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const notes = await response.json();

    if (!notes.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding:20px;color:#94a3b8;">No notes uploaded yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = notes.map(note => `
      <tr style="border-bottom:1px solid #334155;">
        <td style="padding:12px;color:white;">${note.title}</td>
        <td style="padding:12px;color:#94a3b8;">${note.subject}</td>
        <td style="padding:12px;color:#94a3b8;">${note.date || "-"}</td>
        <td style="padding:12px;color:#94a3b8;">${note.content.substring(0, 50)}...</td>
        <td style="padding:12px;">
${note.pdfUrl ? `<button onclick="viewTeacherPDF('${note.pdfUrl}')" style="color:#facc15;background:none;border:none;cursor:pointer;font-size:14px;">👁 View PDF</button>` : "No PDF"}        </td>
        <td style="padding:12px;">
          <button onclick="editNote('${note._id}', '${note.title}', '${note.content}', '${note.date}')" 
            class="btn-outline" style="margin-right:8px;font-size:12px;">Edit</button>
          <button onclick="deleteNote('${note._id}')" 
            style="background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">Delete</button>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding:20px;color:#ef4444;">Failed to load notes.</td></tr>`;
    console.error(err);
  }
}

function editNote(id, title, content, date) {
  const newTitle = prompt("Edit Title:", title);
  if (!newTitle) return;
  const newContent = prompt("Edit Content:", content);
  if (!newContent) return;
  const newDate = prompt("Edit Date:", date);

  updateNote(id, newTitle, newContent, newDate);
}

async function updateNote(id, title, content, date) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${BASE_URL}/api/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title, content, date })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Note updated!");
      loadMyNotes();
    } else {
      alert(data.message);
    }

  } catch (err) {
    alert("Server error.");
    console.error(err);
  }
}

async function deleteNote(id) {
  if (!confirm("Delete this note?")) return;

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${BASE_URL}/api/notes/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();

    if (response.ok) {
      alert("Note deleted!");
      loadMyNotes();
    } else {
      alert(data.message);
    }

  } catch (err) {
    alert("Server error.");
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadMyNotes);
function viewTeacherPDF(pdfUrl) {
  const googleViewer = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  window.open(googleViewer, '_blank');
}