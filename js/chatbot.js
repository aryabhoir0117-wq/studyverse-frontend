var CHAT_URL = "https://studyverse-backend-28sn.onrender.com";

function toggleChat() {
  const box = document.getElementById("aiChatBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const messages = document.getElementById("chatMessages");
  const message = input.value.trim();

  if (!message) return;

  messages.innerHTML += `<div style="text-align:right;margin:8px 0;"><span style="background:#facc15;color:black;padding:6px 10px;border-radius:8px;font-size:13px;">${message}</span></div>`;
  input.value = "";
  messages.scrollTop = messages.scrollHeight;

  messages.innerHTML += `<div id="typing" style="margin:8px 0;color:#94a3b8;font-size:13px;">Poneglyph is thinking... 🗿</div>`;
  messages.scrollTop = messages.scrollHeight;

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${CHAT_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    document.getElementById("typing")?.remove();

    if (response.ok) {
      messages.innerHTML += `<div style="text-align:left;margin:8px 0;"><span style="background:#1e293b;color:white;padding:6px 10px;border-radius:8px;font-size:13px;display:inline-block;max-width:90%;">🗿 ${data.reply}</span></div>`;
    } else {
      messages.innerHTML += `<div style="color:#ef4444;font-size:13px;">Error: ${data.message}</div>`;
    }

    messages.scrollTop = messages.scrollHeight;

  } catch (err) {
    document.getElementById("typing")?.remove();
    messages.innerHTML += `<div style="color:#ef4444;font-size:13px;">Server error. Try again.</div>`;
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("chatInput");
  if (input) {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }
});