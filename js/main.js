document.addEventListener("DOMContentLoaded", () => {


// LOGIN SYSTEM

const loginForm = document.getElementById("loginForm");

if (loginForm) {

loginForm.addEventListener("submit", (e) => {

e.preventDefault();

const username = document.getElementById("username").value.trim();

if(username === ""){
alert("Enter username");
return;
}

localStorage.setItem("user", username);

if(!localStorage.getItem("xp")){
localStorage.setItem("xp", 0);
}

window.location.href = "dashboard.html";

});

}



// DASHBOARD

const displayUser = document.getElementById("displayUser");
const totalXP = document.getElementById("totalXP");
const levelDisplay = document.getElementById("levelDisplay");

if(displayUser){

const user = localStorage.getItem("user");

if(!user){
window.location.href = "login.html";
return;
}

const xp = parseInt(localStorage.getItem("xp")) || 0;

displayUser.textContent = user;
totalXP.textContent = xp;

const ranks = [
"Cabin Boy",
"Deckhand",
"Swordsman",
"Commander",
"Captain",
"Warlord",
"Emperor"
];

const level = Math.floor(xp / 100);

levelDisplay.textContent = ranks[level] || "Pirate King";

}



// LOGOUT

const logoutBtn = document.getElementById("logoutBtn");

if(logoutBtn){

logoutBtn.addEventListener("click", () => {

localStorage.clear();
window.location.href = "../index.html";

});

}



// LESSON SYSTEM

const questionText = document.getElementById("questionText");

if(questionText){

const optionsContainer = document.getElementById("optionsContainer");
const nextBtn = document.getElementById("nextBtn");
const liveXP = document.getElementById("liveXP");
const progressFill = document.getElementById("progressFill");

const questionBank = {

maths:[
{question:"5 + 3 = ?", options:["6","8","9","10"], answer:1},
{question:"12 / 4 = ?", options:["2","3","4","6"], answer:1}
],

science:[
{question:"Water boils at?", options:["50°C","100°C","120°C","0°C"], answer:1},
{question:"Closest planet to Sun?", options:["Earth","Mars","Mercury","Venus"], answer:2}
],

english:[
{question:"Synonym of Happy?", options:["Sad","Angry","Joyful","Cry"], answer:2},
{question:"Correct spelling?", options:["Recieve","Receive","Receeve","Recive"], answer:1}
]

};

const subject = localStorage.getItem("currentSubject");

const questions = questionBank[subject];

let index = 0;
let earnedXP = 0;

liveXP.textContent = earnedXP;

function loadQuestion(){

const q = questions[index];

questionText.textContent = q.question;
optionsContainer.innerHTML = "";
nextBtn.style.display = "none";

let answered = false;

q.options.forEach((option,i)=>{

const btn = document.createElement("button");
btn.textContent = option;

btn.onclick = ()=>{

if(answered) return;

answered = true;

if(i === q.answer){

earnedXP += 10;
liveXP.textContent = earnedXP;
btn.style.background="green";

}else{

btn.style.background="red";

}

nextBtn.style.display="block";

};

optionsContainer.appendChild(btn);

});

progressFill.style.width = (index/questions.length)*100+"%";

}

nextBtn.onclick = ()=>{

index++;

if(index >= questions.length){

let total = parseInt(localStorage.getItem("xp")) || 0;

total += earnedXP;

localStorage.setItem("xp", total);

window.location.href="dashboard.html";

}else{

loadQuestion();

}

};

loadQuestion();

}

});



// SUBJECT SELECT

function startLesson(subject){

localStorage.setItem("currentSubject",subject);

window.location.href="lesson.html";

}



// BACK BUTTON

function goBack(){

window.location.href="dashboard.html";

}