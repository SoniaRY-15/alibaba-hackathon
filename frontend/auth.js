// Check user authentication status and update navbar
function checkAuthStatus() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (token && user) {
    // User is logged in - update navbar
    updateNavbarLoggedIn();
  } else {
    // User is not logged in
    updateNavbarLoggedOut();
  }
}

function updateNavbarLoggedIn() {
  // Find all "Sign Up" links in the navigation
  const signUpLinks = document.querySelectorAll('a[href="login.html"]');

  signUpLinks.forEach((link) => {
    // Replace with Logout button
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

  // Add user info display at the START of nav-links (left side)
  const navLinks = document.querySelector(".nav-links");
  if (navLinks) {
    const user = JSON.parse(localStorage.getItem("user"));
    const userEmail = document.createElement("span");
    userEmail.className = "user-email";
    userEmail.textContent = `Welcome, ${user.email}`;

    // Insert at the beginning (left side)
    navLinks.insertBefore(userEmail, navLinks.firstChild);
  }
}

function updateNavbarLoggedOut() {
  // Sign Up link is already there, nothing to do
}

function logout() {
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Call backend logout endpoint (optional)
  fetch("http://localhost:5000/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }).catch((err) => console.error("Logout error:", err));

  // Redirect to home
  window.location.href = "index.html";
}

// Run on page load
document.addEventListener("DOMContentLoaded", checkAuthStatus);
