const BASE_URL = "https://studyverse-backend-28sn.onrender.com";

const avatars = [
  "../assets/pirate01.png",
  "../assets/pirate02.png",
  "../assets/pirate03.png",
  "../assets/pirate04.png",
  "../assets/pirate05.png",
  "../assets/pirate06.png"
];

document.addEventListener("DOMContentLoaded", async () => {

  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "login.html"; return; }

  try {
    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) { window.location.href = "login.html"; return; }

    const user = await response.json();

    const profileName = document.getElementById("profileName");
    const profileXP = document.getElementById("profileXP");
    const profileRank = document.getElementById("profileRank");
    const profileStreak = document.getElementById("profileStreak");
    const profileLessons = document.getElementById("profileLessons");
    const profileStatus = document.getElementById("profileStatus");
    const profileAvatar = document.getElementById("profileAvatar");

    if (profileName) profileName.textContent = user.username;
    if (profileXP) profileXP.textContent = user.bounty;
    if (profileRank) profileRank.textContent = user.rank;
    if (profileStreak) profileStreak.textContent = user.streak + " days";
    if (profileLessons) profileLessons.textContent = user.lessonsCompleted;

    if (profileStatus) {
      if (user.xp >= 100) {
        profileStatus.textContent = "PASS ✅";
        profileStatus.style.color = "green";
      } else {
        profileStatus.textContent = "FAIL ❌";
        profileStatus.style.color = "red";
      }
    }

    // Load saved avatar or default
    const savedAvatar = localStorage.getItem("selectedAvatar") || avatars[0];
    if (profileAvatar) profileAvatar.src = savedAvatar;

    // Show avatar picker
    const picker = document.getElementById("avatarPicker");
    if (picker) {
      picker.innerHTML = avatars.map((src, i) => `
        <img src="${src}" onclick="selectAvatar('${src}')" 
          style="width:70px;height:70px;object-fit:cover;border-radius:8px;cursor:pointer;border:3px solid ${src === savedAvatar ? '#facc15' : '#334155'};margin:5px;transition:0.3s;">
      `).join("");
    }

  } catch (err) {
    console.error(err);
  }

});

function selectAvatar(src) {
  localStorage.setItem("selectedAvatar", src);
  document.getElementById("profileAvatar").src = src;

  // Update border highlights
  document.querySelectorAll("#avatarPicker img").forEach(img => {
    img.style.border = img.src.includes(src.split("/").pop()) ? "3px solid #facc15" : "3px solid #334155";
  });
}