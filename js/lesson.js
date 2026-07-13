const BASE_URL = "https://studyverse-backend-28sn.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {

  const questionText     = document.getElementById("questionText");
  const optionsContainer = document.getElementById("optionsContainer");
  const nextBtn          = document.getElementById("nextBtn");
  const liveXP           = document.getElementById("liveXP");
  const progressFill     = document.getElementById("progressFill");
  const subjectLabel     = document.getElementById("subjectLabel");
  const questionNum      = document.getElementById("questionNum");
  const loadingScreen    = document.getElementById("loadingScreen");
  const lessonMain       = document.getElementById("lessonMain");

  if (!questionText) return;

  const subject = localStorage.getItem("currentSubject") || "";
  const token   = localStorage.getItem("token");

  if (!token) { window.location.href = "login.html"; return; }
  if (subjectLabel) subjectLabel.textContent = subject.toUpperCase();

  // ── FETCH TEACHER LESSONS via correct student route ──────────────────────
  let questions = [];

  try {
    // ✅ CORRECT ROUTE: /api/lessons/student?subject=...
    const url = `${BASE_URL}/api/lessons/student?subject=${encodeURIComponent(subject)}`;
    const res = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      questions = Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error("Failed to fetch lessons:", err);
  }

  // Hide loading, show content
  if (loadingScreen) loadingScreen.style.display = "none";
  if (lessonMain)    lessonMain.style.display     = "block";

  if (!questions.length) {
    questionText.innerHTML = `
      <span style="font-size:36px;display:block;margin-bottom:16px;">📭</span>
      No questions for <strong>${subject.toUpperCase()}</strong> yet.<br>
      <span style="font-size:13px;opacity:.6;">Your teacher hasn't uploaded lessons for this subject.</span>
    `;
    if (nextBtn) nextBtn.style.display = "none";
    if (optionsContainer) optionsContainer.style.display = "none";
    return;
  }

  // Shuffle for variety
  questions = [...questions].sort(() => Math.random() - 0.5);

  let index    = 0;
  let earnedXP = 0;
  let correct  = 0;
  if (liveXP) liveXP.textContent = earnedXP;

  // ── XP FLOAT ANIMATION ────────────────────────────────────────────────────
  function showXP(amount) {
    const el = document.createElement("div");
    el.className = "xp-float";
    el.textContent = "+" + amount + " XP";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  // ── RENDER QUESTION ───────────────────────────────────────────────────────
  function loadQuestion() {
    const q = questions[index];

    questionText.textContent = q.question;
    optionsContainer.innerHTML = "";
    if (nextBtn) nextBtn.style.display = "none";

    const pct = ((index + 1) / questions.length) * 100;
    if (progressFill) progressFill.style.width = pct + "%";
    if (questionNum)  questionNum.textContent   = `${index + 1} / ${questions.length}`;

    let answered = false;
    const labels = ["A", "B", "C", "D"];

    q.options.forEach((option, i) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.innerHTML = `<span class="opt-label">${labels[i]}</span><span class="opt-text">${option}</span>`;

      btn.onclick = () => {
        if (answered) return;
        answered = true;

        optionsContainer.querySelectorAll(".option-btn")
          .forEach(b => b.disabled = true);

        if (i === q.answer) {
          btn.classList.add("correct");
          earnedXP += 10;
          correct++;
          if (liveXP) liveXP.textContent = earnedXP;
          showXP(10);
        } else {
          btn.classList.add("wrong");
          optionsContainer.querySelectorAll(".option-btn")[q.answer]
            .classList.add("correct");
        }

        if (nextBtn) nextBtn.style.display = "block";
      };

      optionsContainer.appendChild(btn);
    });
  }

  // ── NEXT / FINISH ──────────────────────────────────────────────────────────
  if (nextBtn) {
    nextBtn.onclick = async () => {
      index++;
      if (index >= questions.length) {
        showSummary(earnedXP, correct, questions.length);
        try {
          const res = await fetch(`${BASE_URL}/api/user/update-progress`, {
            method:  "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body:    JSON.stringify({ earnedXP })
          });
          if (res.ok) {
            const data = await res.json();
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            Object.assign(user, {
              xp: data.xp, bounty: data.bounty,
              streak: data.streak, rank: data.rank,
              lessonsCompleted: data.lessonsCompleted
            });
            localStorage.setItem("user", JSON.stringify(user));
          }
        } catch (err) { console.error("Progress update failed:", err); }
      } else {
        loadQuestion();
      }
    };
  }

  // ── SUMMARY OVERLAY ────────────────────────────────────────────────────────
  function showSummary(xp, correct, total) {
    const overlay = document.getElementById("summaryOverlay");
    if (!overlay) { window.location.href = "dashboard.html"; return; }
    document.getElementById("summaryXP").textContent      = xp;
    document.getElementById("summaryCorrect").textContent  = correct + " / " + total;
    const pct = Math.round((correct / total) * 100);
    document.getElementById("summaryPct").textContent     = pct + "%";
    const msg = document.getElementById("summaryMsg");
    if (pct === 100)     msg.textContent = "Perfect! Legendary voyage! 🏴‍☠️";
    else if (pct >= 70)  msg.textContent = "Great work, Captain! ⚓";
    else if (pct >= 40)  msg.textContent = "Keep sailing, you're improving! 🌊";
    else                 msg.textContent = "Don't give up — the sea rewards persistence! ⛵";
    overlay.style.display = "flex";
  }

  loadQuestion();
});

function goBack()        { window.location.href = "dashboard.html"; }
function goToDashboard() { window.location.href = "dashboard.html"; }