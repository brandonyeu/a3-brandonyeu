async function tryFetchSession() {
  const endpoints = ["/session", "/me", "/whoami"];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { credentials: "same-origin" });
      if (!res.ok && res.status !== 401 && res.status !== 404) {
      }
      try {
        const data = await res.json();
        if (data && (data.loggedIn === true || data.loggedIn === false || data.user || data.username)) {
          return { ok: true, data };
        }
      } catch (e) {
      }
    } catch (err) {
    }
  }
  return { ok: false };
}

async function safeLogout() {
  try {
    const postRes = await fetch("/logout", { method: "POST", credentials: "same-origin" });
    if (postRes.ok) return true;
  } catch (e) { }
  try {
    const getRes = await fetch("/logout", { method: "GET", credentials: "same-origin" });
    if (getRes.ok) return true;
  } catch (e) { }
  return false;
}

function showLoggedIn(username) {
  const area = document.getElementById("accountArea");
  area.innerHTML = `
      <p>Signed in as <strong>${escapeHtml(username)}</strong></p>
      <div style="display:flex; gap:12px; justify-content:center; margin-top:10px;">
        <button id="logoutBtn" class="btn">Sign Out</button>
      </div>
    `;

  const btn = document.getElementById("logoutBtn");
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.textContent = "Signing out...";
    const ok = await safeLogout();
    if (ok) {
      window.location.href = "/index.html";
    } else {
      alert("Logout failed. Try refreshing the page.");
      btn.disabled = false;
      btn.textContent = "Sign Out";
    }
  });
}

function showLoggedOut() {
  const area = document.getElementById("accountArea");
  area.innerHTML = `
      <p>You are not signed in.</p>
      <div style="display:flex; gap:12px; justify-content:center; margin-top:10px;">
        <button id="goLogin" class="btn">Login</button>
        <button id="goSignup" class="btn">Sign Up</button>
      </div>
    `;
  document.getElementById("goLogin").addEventListener("click", () => {
    window.location.href = "/login.html";
  });
  document.getElementById("goSignup").addEventListener("click", () => {
    window.location.href = "/signup.html";
  });
}

function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.addEventListener("load", async () => {
  const result = await tryFetchSession();
  if (!result.ok) {
    showLoggedOut();
    return;
  }
  const s = result.data;

  if (s.loggedIn === true || (s.user && s.user.username) || s.username) {
    const username =
      (s.user && s.user.username) ||
      s.username ||
      (s.user && s.user.name) ||
      (s.user && s.user.id) ||
      "user";
    showLoggedIn(username);
  } else {
    showLoggedOut();
  }
});
