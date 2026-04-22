// const questions = [

// {q:"5 + 5 ?",o:["8","10","12","6"],a:1},
// {q:"Planet closest to Sun?",o:["Mars","Mercury","Earth","Venus"],a:1},
// {q:"10 / 2 ?",o:["2","3","5","7"],a:2},
// {q:"Capital of France?",o:["Paris","Rome","Berlin","Madrid"],a:0},
// {q:"Water formula?",o:["CO2","H2O","O2","NaCl"],a:1}

// ];

// let index = 0;
// let score = 0;

// function loadDuel(){

// const q = questions[index];

// document.getElementById("duelQuestion").textContent = q.q;

// const container = document.getElementById("duelOptions");
// container.innerHTML="";

// q.o.forEach((opt,i)=>{

// const btn=document.createElement("button");
// btn.textContent=opt;

// btn.onclick=()=>{

// if(i===q.a){
// score+=10;
// document.getElementById("duelScore").textContent=score;
// }

// index++;

// if(index>=questions.length){

// alert("Duel finished. Score: "+score);

// let xp = parseInt(localStorage.getItem("xp")) || 0;
// xp += score;

// localStorage.setItem("xp",xp);

// window.location.href="dashboard.html";

// }else{
// loadDuel();
// }

// };

// container.appendChild(btn);

// });

// }

// loadDuel();

const BASE_URL = "https://studyverse-backend-28sn.onrender.com";

const questions = [
  { q: "5 + 5 ?", o: ["8", "10", "12", "6"], a: 1 },
  { q: "Planet closest to Sun?", o: ["Mars", "Mercury", "Earth", "Venus"], a: 1 },
  { q: "10 / 2 ?", o: ["2", "3", "5", "7"], a: 2 },
  { q: "Capital of France?", o: ["Paris", "Rome", "Berlin", "Madrid"], a: 0 },
  { q: "Water formula?", o: ["CO2", "H2O", "O2", "NaCl"], a: 1 }
];

let index = 0;
let score = 0;

function loadDuel() {
  const q = questions[index];

  document.getElementById("duelQuestion").textContent = q.q;

  const container = document.getElementById("duelOptions");
  container.innerHTML = "";

  q.o.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;

    btn.onclick = async () => {
      if (i === q.a) {
        score += 10;
        document.getElementById("duelScore").textContent = score;
      }

      index++;

      if (index >= questions.length) {

        // Send XP to backend
        const token = localStorage.getItem("token");

        if (token) {
          try {
            const response = await fetch(`${BASE_URL}/api/user/update-progress`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ earnedXP: score })
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
            console.error("Failed to update duel XP:", err);
          }
        }

        alert("Duel finished! You earned " + score + " bounty! 🏴‍☠️");
        window.location.href = "dashboard.html";

      } else {
        loadDuel();
      }
    };

    container.appendChild(btn);
  });
}

loadDuel();