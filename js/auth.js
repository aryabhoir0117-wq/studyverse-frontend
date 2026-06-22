const AUTH_BASE_URL = "https://studyverse-backend-28sn.onrender.com";

// ── Role → page redirect map ──────────────────────────────────────────────
const ROLE_REDIRECT = {
  superadmin: "superadmin-dashboard.html",
  admin:      "admin-dashboard.html",
  teacher:    "teacher-picker.html",
  student:    "dashboard.html"
};

/* ══════════════════════════════════════════
   THEME
══════════════════════════════════════════ */
(function initTheme() {
  const saved = localStorage.getItem("sv-theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeBtn(saved);
})();

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next    = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("sv-theme", next);
  updateThemeBtn(next);
}

function updateThemeBtn(theme) {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.querySelector(".icon").textContent  = theme === "dark" ? "☀️" : "🌙";
  btn.querySelector(".label").textContent = theme === "dark" ? "Light" : "Dark";
}

/* ══════════════════════════════════════════
   STARS
══════════════════════════════════════════ */
function initStars() {
  const container = document.getElementById("stars");
  if (!container) return;
  for (let i = 0; i < 60; i++) {
    const s = document.createElement("div");
    s.className = "star";
    const size = Math.random() * 2 + 0.8;
    s.style.cssText = `width:${size}px;height:${size}px;top:${Math.random()*80}%;left:${Math.random()*100}%;--d:${2+Math.random()*4}s;--delay:${Math.random()*5}s`;
    container.appendChild(s);
  }
}

/* ══════════════════════════════════════════
   VALIDATION
══════════════════════════════════════════ */
function validateUsername(val) {
  if (!val)            return { ok: false, msg: "" };
  if (val.length < 3)  return { ok: false, msg: "At least 3 characters" };
  if (val.length > 20) return { ok: false, msg: "20 characters max" };
  if (/^[^a-zA-Z]/.test(val)) return { ok: false, msg: "Must start with a letter" };
  if (!/^[a-zA-Z0-9_]+$/.test(val)) return { ok: false, msg: "Letters, numbers, underscores only" };
  return { ok: true, msg: "✓ Good" };
}

function validateEmail(val) {
  if (!val) return { ok: false, msg: "" };
  if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(val))
    return { ok: false, msg: "Enter a valid email" };
  return { ok: true, msg: "" };
}

function getStrength(val) {
  if (!val) return 0;
  let s = 0;
  if (val.length >= 8)  s++;
  if (val.length >= 12) s++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) s++;
  if (/[0-9]/.test(val)) s++;
  if (/[^a-zA-Z0-9]/.test(val)) s++;
  return Math.min(4, s);
}

function validatePassword(val, minLen = 8) {
  if (!val) return { ok: false, msg: "", strength: 0 };
  const strength = getStrength(val);
  if (val.length < minLen) return { ok: false, msg: `Min ${minLen} characters`, strength };
  if (!/[A-Za-z]/.test(val)) return { ok: false, msg: "Add at least one letter", strength };
  if (!/[0-9]/.test(val))    return { ok: false, msg: "Add at least one number", strength };
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return { ok: true, msg: `Strength: ${labels[strength]}`, strength };
}

function validateConfirm(pass, confirm) {
  if (!confirm) return { ok: false, msg: "" };
  if (pass !== confirm) return { ok: false, msg: "Passwords do not match" };
  return { ok: true, msg: "✓ Passwords match" };
}

/* ══════════════════════════════════════════
   UI HELPERS
══════════════════════════════════════════ */
function applyField(input, statusId, msgId, result) {
  input.className = input.value ? (result.ok ? "valid" : "invalid") : "";
  const s = document.getElementById(statusId);
  const m = document.getElementById(msgId);
  if (s) s.textContent = input.value ? (result.ok ? "✅" : "❌") : "";
  if (m) {
    m.textContent = result.msg;
    m.className   = "field-msg " + (result.ok ? "success" : result.msg ? "error" : "");
  }
}

function setStrengthBar(strength) {
  const cls = strength <= 1 ? "weak" : strength <= 2 ? "medium" : "strong";
  ["seg1","seg2","seg3","seg4"].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.className = "strength-seg" + (i < strength ? " " + cls : "");
  });
}

function showError(msg, bannerId = "errorBanner") {
  const b = document.getElementById(bannerId);
  if (!b) return;
  b.textContent   = "⚠️ " + msg;
  b.style.display = "block";
}

function hideError(bannerId = "errorBanner") {
  const b = document.getElementById(bannerId);
  if (b) b.style.display = "none";
}

function setBtn(id, disabled, text) {
  const b = document.getElementById(id);
  if (b) { b.disabled = disabled; b.textContent = text; }
}

/* ══════════════════════════════════════════
   SESSION HELPERS
══════════════════════════════════════════ */
function saveSession(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify({
    _id:      data._id,
    username: data.username,
    email:    data.email,
    role:     data.role,
    schoolId: data.schoolId || null,
    xp:       data.xp      || 0,
    bounty:   data.bounty  || 0,
    streak:   data.streak  || 0,
    rank:     data.rank    || "Cabin Boy",
    lessonsCompleted: data.lessonsCompleted || 0
  }));
}

function redirectByRole(role) {
  const page = ROLE_REDIRECT[role] || "dashboard.html";
  window.location.href = page;
}

/* ══════════════════════════════════════════
   FIRST LOGIN — force password change
══════════════════════════════════════════ */
let _pendingRedirectRole = null; // stored so we can redirect after password change

function showFirstLoginModal(role) {
  _pendingRedirectRole = role;
  const overlay = document.getElementById("firstLoginOverlay");
  if (overlay) overlay.style.display = "flex";
}

window.submitPasswordChange = async function () {
  const newPwd     = document.getElementById("newPassword").value;
  const confirmPwd = document.getElementById("confirmNewPassword").value;

  hideError("changePwdError");

  if (!validatePassword(newPwd).ok) {
    showError(validatePassword(newPwd).msg || "Invalid password", "changePwdError");
    return;
  }
  if (newPwd !== confirmPwd) {
    showError("Passwords do not match", "changePwdError");
    return;
  }

  setBtn("changePwdBtn", true, "Saving…");

  try {
    const token = localStorage.getItem("token");
    const res   = await fetch(`${AUTH_BASE_URL}/api/auth/change-password`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ newPassword: newPwd })
    });
    const data = await res.json();

    if (res.ok) {
      // Update stored user — mark isFirstLogin false
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      u.isFirstLogin = false;
      localStorage.setItem("user", JSON.stringify(u));
      redirectByRole(_pendingRedirectRole);
    } else {
      showError(data.message || "Failed to change password", "changePwdError");
      setBtn("changePwdBtn", false, "Set Password & Continue");
    }
  } catch {
    showError("Server error. Try again.", "changePwdError");
    setBtn("changePwdBtn", false, "Set Password & Continue");
  }
};

/* ══════════════════════════════════════════
   REGISTER (existing — kept for Google OAuth)
══════════════════════════════════════════ */
function initRegister() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const u = document.getElementById("username");
  const e = document.getElementById("email");
  const p = document.getElementById("password");
  const c = document.getElementById("confirmPassword");

  u.addEventListener("input", () => applyField(u, "usernameStatus", "usernameMsg", validateUsername(u.value.trim())));
  e.addEventListener("input", () => applyField(e, "emailStatus", "emailMsg", validateEmail(e.value.trim())));

  p.addEventListener("input", () => {
    const r = validatePassword(p.value);
    applyField(p, "passwordStatus", "passwordMsg", r);
    setStrengthBar(r.strength);
    if (c.value) applyField(c, "confirmStatus", "confirmMsg", validateConfirm(p.value, c.value));
  });

  c.addEventListener("input", () =>
    applyField(c, "confirmStatus", "confirmMsg", validateConfirm(p.value, c.value))
  );

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    hideError();

    const username = u.value.trim();
    const email    = e.value.trim();
    const password = p.value;
    const confirm  = c.value;

    if (!validateUsername(username).ok) { showError(validateUsername(username).msg || "Invalid username"); return; }
    if (!validateEmail(email).ok)       { showError("Enter a valid email"); return; }
    if (!validatePassword(password).ok) { showError(validatePassword(password).msg || "Invalid password"); return; }
    if (!validateConfirm(password, confirm).ok) { showError("Passwords do not match"); return; }

    setBtn("registerBtn", true, "Joining the fleet…");

    try {
      const res  = await fetch(`${AUTH_BASE_URL}/api/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, email, password, role: "student" }) // always student on self-register
      });
      const data = await res.json();

      if (res.ok) {
        saveSession(data);
        redirectByRole(data.role);
      } else {
        showError(data.message || "Registration failed");
        setBtn("registerBtn", false, "Join the Crew");
      }
    } catch {
      showError("Server error. Try again.");
      setBtn("registerBtn", false, "Join the Crew");
    }
  });
}

/* ══════════════════════════════════════════
   LOGIN
══════════════════════════════════════════ */
function initLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const e = document.getElementById("loginEmail");
  const p = document.getElementById("loginPassword");

  e.addEventListener("input", () =>
    applyField(e, "emailStatus", "emailMsg", validateEmail(e.value.trim()))
  );
  p.addEventListener("input", () => {
    const r = validatePassword(p.value, 6);
    p.className = p.value ? (r.ok ? "valid" : "invalid") : "";
    const s = document.getElementById("passwordStatus");
    const m = document.getElementById("passwordMsg");
    if (s) s.textContent = p.value ? (r.ok ? "✅" : "") : "";
    if (m) { m.textContent = r.msg; m.className = "field-msg" + (r.msg ? " error" : ""); }
  });

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    hideError();

    const email    = e.value.trim();
    const password = p.value.trim();

    if (!email || !password)       { showError("Fill in all fields"); return; }
    if (!validateEmail(email).ok)  { showError("Enter a valid email"); return; }
    if (password.length < 6)       { showError("Password must be at least 6 characters"); return; }

    setBtn("loginBtn", true, "Sailing…");

    try {
      const res  = await fetch(`${AUTH_BASE_URL}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        saveSession(data);

        // If first login (admin-created account), force password change
        if (data.isFirstLogin) {
          showFirstLoginModal(data.role);
        } else {
          redirectByRole(data.role);
        }
      } else {
        showError(data.message || "Invalid credentials");
        setBtn("loginBtn", false, "Board the Ship");
      }
    } catch {
      showError("Server error. Try again.");
      setBtn("loginBtn", false, "Board the Ship");
    }
  });
}

/* ══════════════════════════════════════════
   GOOGLE AUTH
══════════════════════════════════════════ */
window.handleGoogleCredential = async function (response) {
  hideError();
  const btnId = document.getElementById("registerBtn") ? "registerBtn" : "loginBtn";
  const originalText = document.getElementById(btnId)?.textContent || "";
  setBtn(btnId, true, "Signing in with Google…");

  try {
    const res  = await fetch(`${AUTH_BASE_URL}/api/auth/google`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ credential: response.credential, role: "student" })
    });
    const data = await res.json();

    if (res.ok) {
      saveSession(data);
      // Google users can never be isFirstLogin from admin — safe to redirect directly
      redirectByRole(data.role);
    } else {
      showError(data.message || "Google sign-in failed");
      setBtn(btnId, false, originalText);
    }
  } catch {
    showError("Server error during Google sign-in.");
    setBtn(btnId, false, originalText);
  }
};

/* ══════════════════════════════════════════
   BOOT
══════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  initStars();
  initRegister();
  initLogin();
  const btn = document.getElementById("themeToggle");
  if (btn) btn.addEventListener("click", toggleTheme);
});
