const submit = async function (event) {
  event.preventDefault();

  const data = {
    yourname: document.querySelector("#yourname").value,
    event: document.querySelector("input[name='event']:checked")?.value || "",
    numAdditional: parseInt(document.querySelector("#numAdditional").value) || 0,
    phoneNumber: document.querySelector("#phoneNumber").value,
    emailAddress: document.querySelector("#emailAddress").value,
  };

  try {
    const response = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const serverData = await response.json();

    if (response.ok) {
      alert("RSVP submitted successfully!");
      document.querySelector("form").reset();
    } else {
      alert(serverData.message || "Something went wrong. Please try again. Must be signed in to submit");
    }
  } catch (err) {
    console.error("Error submitting RSVP:", err);
    alert("Error connecting to the server. Please try again later.");
  }
};

async function updateNavbar() {
  const navRight = document.querySelector("#nav-right");
  if (!navRight) return;

  try {
    const res = await fetch("/session");
    const session = await res.json();

    navRight.innerHTML = "";

    if (session.loggedIn) {
      navRight.innerHTML = `
        <li class="dropdown">
          <a href="#" id="profile-icon">👤</a>
          <ul class="dropdown-menu">
            <li><a href="#" id="logout-link">Sign Out</a></li>
          </ul>
        </li>
      `;

      document.querySelector("#logout-link").onclick = async (e) => {
        e.preventDefault();
        await fetch("/logout", { method: "POST" });
        location.reload();
      };
    } else {
      navRight.innerHTML = `<li><a href="login.html">Login</a></li>`;
    }
  } catch (err) {
    console.error("Error fetching session:", err);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.success) {
      window.location.href = "index.html";
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error("Login failed:", err);
    alert("Error logging in. Please try again.");
  }
}

window.onload = function () {
  const submitBtn = document.querySelector("form button");
  if (submitBtn) submitBtn.onclick = submit;

  const loginForm = document.querySelector("#loginForm");
  if (loginForm) loginForm.onsubmit = handleLogin;

  updateNavbar();
};
