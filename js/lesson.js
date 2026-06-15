const BASE_URL = "https://studyverse-backend-28sn.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {

  function showXP(amount) {
    const xp = document.createElement("div");
    xp.className = "xp-float";
    xp.textContent = "+" + amount + " XP";
    document.body.appendChild(xp);
    setTimeout(() => xp.remove(), 1200);
  }

  const questionText = document.getElementById("questionText");
  if (!questionText) return;

  const optionsContainer = document.getElementById("optionsContainer");
  const nextBtn = document.getElementById("nextBtn");
  const liveXP = document.getElementById("liveXP");
  const progressFill = document.getElementById("progressFill");

  const questionBank = {
    maths: [
      { question: "5 + 3 = ?", options: ["6", "8", "9", "10"], answer: 1 },
      { question: "12 / 4 = ?", options: ["2", "3", "4", "6"], answer: 1 }
    ],
    science: [
      { question: "Water boils at?", options: ["50°C", "100°C", "120°C", "0°C"], answer: 1 },
      { question: "Closest planet to Sun?", options: ["Earth", "Mars", "Mercury", "Venus"], answer: 2 }
    ],
    english: [
      { question: "Synonym of Happy?", options: ["Sad", "Angry", "Joyful", "Cry"], answer: 2 },
      { question: "Correct spelling?", options: ["Recieve", "Receive", "Receeve", "Recive"], answer: 1 }
    ],
    gk: [
      { question: "How many continents?", options: ["5", "8", "7", "6"], answer: 2 },
      { question: "Which country has most natural lakes?", options: ["India", "Canada", "China", "Thailand"], answer: 1 }
    ]
  };

  const subject = localStorage.getItem("currentSubject");
  const token = localStorage.getItem("token");

  // Fetch teacher lessons from backend
  try {
    const response = await fetch(`${BASE_URL}/api/lessons/${subject}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.ok) {
      const teacherLessons = await response.json();
      if (teacherLessons.length > 0) {
        if (!questionBank[subject]) questionBank[subject] = [];
        questionBank[subject] = questionBank[subject].concat(teacherLessons);
      }
    }
  } catch (err) {
    console.error("Failed to fetch teacher lessons:", err);
  }

  const questions = questionBank[subject];

  if (!questions || questions.length === 0) {
    questionText.textContent = "No questions available for this subject.";
    return;
  }

  let index = 0;
  let earnedXP = 0;
  liveXP.textContent = earnedXP;

  function loadQuestion() {
    const q = questions[index];
    questionText.textContent = q.question;
    optionsContainer.innerHTML = "";
    nextBtn.style.display = "none";

    let answered = false;

    q.options.forEach((option, i) => {
      const btn = document.createElement("button");
      btn.textContent = option;

      btn.onclick = () => {
        if (answered) return;
        answered = true;

        if (i === q.answer) {
          earnedXP += 10;
          liveXP.textContent = earnedXP;
          btn.style.background = "green";
          btn.style.color = "white";
          showXP(10);
        } else {
          btn.style.background = "red";
          btn.style.color = "white";

          // ✅ Show correct answer
    const allBtns = optionsContainer.querySelectorAll("button");
    allBtns[q.answer].style.background = "green";
    allBtns[q.answer].style.color = "white";
        }

        nextBtn.style.display = "block";
      };

      optionsContainer.appendChild(btn);
    });

    progressFill.style.width = ((index + 1) / questions.length) * 100 + "%";
  }

  nextBtn.onclick = async () => {
    index++;

    if (index >= questions.length) {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const response = await fetch(`${BASE_URL}/api/user/update-progress`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ earnedXP })
          });

          const data = await response.json();

          if (response.ok) {
            const user = JSON.parse(localStorage.getItem("user"));
            user.xp = data.xp;
            user.bounty = data.bounty;
            user.streak = data.streak;
            user.rank = data.rank;
            user.lessonsCompleted = data.lessonsCompleted;
            localStorage.setItem("user", JSON.stringify(user));
          }

        } catch (err) {
          console.error("Failed to update progress:", err);
        }
      }

      window.location.href = "dashboard.html";

    } else {
      loadQuestion();
    }
  };

  loadQuestion();

});

function goBack() {
  window.location.href = "dashboard.html";
}