// Check user authentication status and update navbar
function checkAuthStatus() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (token && user) {
    updateNavbarLoggedIn();
  } else {
    updateNavbarLoggedOut();
  }
}

function updateNavbarLoggedIn() {
  const signUpLinks = document.querySelectorAll('a[href="login.html"]');

  signUpLinks.forEach((link) => {
    const logoutBtn = document.createElement("a");
    logoutBtn.href = "#";
    logoutBtn.className = "nav-link logout-btn";
    logoutBtn.textContent = "Logout";
    logoutBtn.onclick = (e) => {
      e.preventDefault();
      logout();
    };

    link.replaceWith(logoutBtn);
  });

  const navLinks = document.querySelector(".nav-links");
  if (navLinks) {
    const user = JSON.parse(localStorage.getItem("user"));
    const userEmail = document.createElement("span");
    userEmail.className = "user-email";
    userEmail.textContent = `Welcome, ${user.email}`;

    navLinks.insertBefore(userEmail, navLinks.firstChild);
  }
}

function updateNavbarLoggedOut() {
  // Sign Up link is already there, nothing to do
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  fetch("http://localhost:5000/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }).catch((err) => console.error("Logout error:", err));

  // Redirect to home
  window.location.href = "index.html";
}

// Run on page load
document.addEventListener("DOMContentLoaded", checkAuthStatus);
