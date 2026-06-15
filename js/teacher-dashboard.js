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

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
      localStorage.clear();
      window.location.href = "login.html";
      return;
    }

    const user = await response.json();

    if (user.role !== "teacher") {
      window.location.href = "dashboard.html";
      return;
    }

    const nameEl = document.getElementById("displayTeacher");
    if (nameEl) nameEl.textContent = user.username;

    // Fetch lesson count from backend
    const lessonRes = await fetch(`${BASE_URL}/api/lessons/my/lessons`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const lessons = await lessonRes.json();
    if (document.getElementById("lessonCount")) {
      document.getElementById("lessonCount").textContent = lessons.length || 0;
    }

    // Fetch notes count from backend
    const notesRes = await fetch(`${BASE_URL}/api/notes/my-notes`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const notes = await notesRes.json();
    if (document.getElementById("notesCount")) {
      document.getElementById("notesCount").textContent = notes.length || 0;
    }

    // Fetch actual student count
    try {
      const studentsRes = await fetch(`${BASE_URL}/api/students`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (studentsRes.ok) {
        const students = await studentsRes.json();
        const count = Array.isArray(students) ? students.length : (students.students?.length || 0);
        if (document.getElementById("studentCount")) {
          document.getElementById("studentCount").textContent = count;
        }
      } else {
        // Fallback: count unique students enrolled across all lessons
        let uniqueStudents = new Set();
        (Array.isArray(lessons) ? lessons : []).forEach(lesson => {
          (lesson.enrolledStudents || lesson.students || []).forEach(s => {
            uniqueStudents.add(s._id || s.id || s.email);
          });
        });
        if (document.getElementById("studentCount")) {
          document.getElementById("studentCount").textContent = uniqueStudents.size || "—";
        }
      }
    } catch {
      if (document.getElementById("studentCount")) {
        document.getElementById("studentCount").textContent = "—";
      }
    }

  } catch (err) {
    console.error("Failed to load teacher dashboard:", err);
    alert("Could not connect to server.");
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }

});

function goCreateLesson() {
  window.location.href = "create-lesson.html";
}

function goUploadNotes() {
  window.location.href = "upload-notes.html";
}

// Now navigates to the real student progress page instead of an alert
function goProgress() {
  window.location.href = "student-progress.html";
}