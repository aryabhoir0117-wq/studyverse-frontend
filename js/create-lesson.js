const BASE_URL = "https://studyverse-backend-28sn.onrender.com";

async function generateWithAI() {
  const topic = document.getElementById("topicInput").value.trim();
  const subject = document.getElementById("lessonSubject").value;
  const status = document.getElementById("aiStatus");

  if (!topic) {
    alert("Enter a topic first");
    return;
  }

  status.textContent = "⚡ Generating...";

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${BASE_URL}/api/lesson-ai/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ topic, subject })
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById("questionInput").value = data.question;
      document.getElementById("opt1").value = data.options[0];
      document.getElementById("opt2").value = data.options[1];
      document.getElementById("opt3").value = data.options[2];
      document.getElementById("opt4").value = data.options[3];
      document.getElementById("answerIndex").value = data.answer;
      status.textContent = "✅ Generated! Review and save.";
    } else {
      status.textContent = "❌ " + data.message;
    }

  } catch (err) {
    status.textContent = "❌ Server error.";
    console.error(err);
  }
}

async function saveLesson() {
  const subject = document.getElementById("lessonSubject").value;
  const question = document.getElementById("questionInput").value;
  const options = [
    document.getElementById("opt1").value,
    document.getElementById("opt2").value,
    document.getElementById("opt3").value,
    document.getElementById("opt4").value
  ];
  const answer = Number(document.getElementById("answerIndex").value);
  const token = localStorage.getItem("token");

  if (!question || options.some(o => !o)) {
    alert("Please fill all fields");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/lessons/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ subject, question, options, answer })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Lesson Saved!");
      document.getElementById("questionInput").value = "";
      document.getElementById("opt1").value = "";
      document.getElementById("opt2").value = "";
      document.getElementById("opt3").value = "";
      document.getElementById("opt4").value = "";
      document.getElementById("answerIndex").value = "";
      document.getElementById("topicInput").value = "";
      document.getElementById("aiStatus").textContent = "";
    } else {
      alert(data.message);
    }

  } catch (err) {
    alert("Server error.");
    console.error(err);
  }
}
async function loadMyLessons() {
  const token = localStorage.getItem("token");
  const tbody = document.getElementById("lessonsTableBody");

  try {
    const response = await fetch(`${BASE_URL}/api/lessons/my/lessons`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const lessons = await response.json();

    if (!lessons.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="padding:20px;color:#94a3b8;">No lessons created yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = lessons.map(lesson => `
      <tr style="border-bottom:1px solid #334155;">
        <td style="padding:12px;color:#94a3b8;">${lesson.subject}</td>
        <td style="padding:12px;color:white;">${lesson.question}</td>
        <td style="padding:12px;color:#94a3b8;">${lesson.options[lesson.answer]}</td>
        <td style="padding:12px;">
          <button onclick="deleteLesson('${lesson._id}')"
            style="background:#ef4444;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">Delete</button>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="padding:20px;color:#ef4444;">Failed to load lessons.</td></tr>`;
  }
}

async function deleteLesson(id) {
  if (!confirm("Delete this lesson?")) return;

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${BASE_URL}/api/lessons/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();

    if (response.ok) {
      alert("Lesson deleted!");
      loadMyLessons();
    } else {
      alert(data.message);
    }

  } catch (err) {
    alert("Server error.");
  }
}

document.addEventListener("DOMContentLoaded", loadMyLessons);
