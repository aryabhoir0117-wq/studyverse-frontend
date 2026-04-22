const BASE_URL = "https://studyverse-backend-28sn.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {

  function showXP(amount) {
    const xp = document.createElement("div");
    xp.className = "xp-float";
    xp.textContent = "+" + amount + " XP";
    document.body.appendChild(xp);
    setTimeout(() => xp.remove(), 1200);
  }

  const questionText     = document.getElementById("questionText");
  if (!questionText) return;

  const optionsContainer = document.getElementById("optionsContainer");
  const nextBtn          = document.getElementById("nextBtn");
  const liveXP           = document.getElementById("liveXP");
  const progressFill     = document.getElementById("progressFill");
  const questionCounter  = document.getElementById("questionCounter");
  const totalQuestions   = document.getElementById("totalQuestions");

  const subject = localStorage.getItem("currentSubject");
  const unit    = localStorage.getItem("currentUnit");   // ← set by dashboard when student picks unit
  const token   = localStorage.getItem("token");

  if (!subject || !unit) {
    questionText.textContent = "No subject or unit selected. Go back to dashboard.";
    return;
  }

  // Fallback question bank (shown if no teacher lessons exist for this unit)
  const questionBank = {
    maths: {
      "Unit 1": [
        { question: "5 + 3 = ?",   options: ["6","8","9","10"], answer: 1 },
        { question: "12 / 4 = ?",  options: ["2","3","4","6"],  answer: 1 }
      ],
      "Unit 2": [
        { question: "7 × 8 = ?",   options: ["54","56","58","60"], answer: 1 },
        { question: "√144 = ?",    options: ["10","11","12","13"], answer: 2 }
      ]
    },
    science: {
      "Unit 1": [
        { question: "Water boils at?",          options: ["50°C","100°C","120°C","0°C"], answer: 1 },
        { question: "Closest planet to Sun?",   options: ["Earth","Mars","Mercury","Venus"], answer: 2 }
      ],
      "Unit 2": [
        { question: "Photosynthesis produces?", options: ["CO2","O2","N2","H2"], answer: 1 },
        { question: "Unit of force?",           options: ["Joule","Newton","Watt","Pascal"], answer: 1 }
      ]
    },
    english: {
      "Unit 1": [
        { question: "Synonym of Happy?",  options: ["Sad","Angry","Joyful","Cry"], answer: 2 },
        { question: "Correct spelling?",  options: ["Recieve","Receive","Receeve","Recive"], answer: 1 }
      ],
      "Unit 2": [
        { question: "Antonym of Ancient?", options: ["Old","Modern","Worn","Pale"], answer: 1 },
        { question: "Plural of 'child'?",  options: ["Childs","Childrens","Children","Childes"], answer: 2 }
      ]
    }
  };

  // Fetch teacher-created lessons for this subject + unit
  let questions = [];

  try {
    const response = await fetch(
      `${BASE_URL}/api/lessons/${subject}?unit=${encodeURIComponent(unit)}`,
      { headers: { "Authorization": `Bearer ${token}` } }
    );

    if (response.ok) {
      const teacherLessons = await response.json();
      if (teacherLessons.length > 0) {
        questions = teacherLessons;
      }
    }
  } catch (err) {
    console.error("Failed to fetch teacher lessons:", err);
  }

  // Fall back to local bank if no teacher lessons for this unit
  if (!questions.length) {
    questions = (questionBank[subject] && questionBank[subject][unit]) || [];
  }

  if (!questions.length) {
    questionText.textContent = `No questions available for ${subject} — ${unit} yet.`;
    return;
  }

  let index    = 0;
  let earnedXP = 0;
  liveXP.textContent = earnedXP;
  if (totalQuestions) totalQuestions.textContent = questions.length;

  function loadQuestion() {
    const q = questions[index];
    questionText.textContent = q.question;
    optionsContainer.innerHTML = "";
    nextBtn.style.display = "none";
    if (questionCounter) questionCounter.textContent = index + 1;

    let answered = false;

    q.options.forEach((option, i) => {
      // Use exposed helper if available (pirate UI), else plain button
      let btn;
      if (typeof window.createOptionBtn === "function") {
        btn = window.createOptionBtn(option, i, () => handleAnswer(i, q, answered, () => { answered = true; }));
      } else {
        btn = document.createElement("button");
        btn.textContent = option;
        btn.onclick = () => handleAnswer(i, q, answered, () => { answered = true; });
      }
      optionsContainer.appendChild(btn);
    });

    progressFill.style.width = ((index + 1) / questions.length) * 100 + "%";
  }

  function handleAnswer(i, q, answered, markAnswered) {
    if (answered) return;
    markAnswered();

    const allBtns = optionsContainer.querySelectorAll("button");

    if (i === q.answer) {
      earnedXP += 10;
      liveXP.textContent = earnedXP;
      allBtns[i].classList.add("correct");
      showXP(10);
      if (typeof window.onCorrectAnswer === "function") window.onCorrectAnswer(allBtns[i]);
    } else {
      allBtns[i].classList.add("wrong");
      allBtns[q.answer].classList.add("correct");
      if (typeof window.onWrongAnswer === "function") window.onWrongAnswer();
    }

    nextBtn.style.display = "block";
  }

  nextBtn.onclick = async () => {
    index++;

    if (index >= questions.length) {
      // Update progress on backend
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
          user.xp               = data.xp;
          user.bounty           = data.bounty;
          user.streak           = data.streak;
          user.rank             = data.rank;
          user.lessonsCompleted = data.lessonsCompleted;
          localStorage.setItem("user", JSON.stringify(user));
        }
      } catch (err) {
        console.error("Failed to update progress:", err);
      }

      // Show completion overlay if available, else go back to dashboard
      if (typeof window.showCompletion === "function") {
        const correct = Math.floor(earnedXP / 10);
        window.showCompletion(earnedXP, correct, questions.length);
      } else {
        window.location.href = "dashboard.html";
      }

    } else {
      loadQuestion();
    }
  };

  loadQuestion();
});

function goBack() {
  window.location.href = "dashboard.html";
}