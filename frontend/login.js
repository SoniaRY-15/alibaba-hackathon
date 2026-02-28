const form = document.querySelector("form");
const emailInput = document.querySelector(".input-email");
const passwordInput = document.querySelector(".input-pw");
const button = document.querySelector(".button-sign-up");

const API_URL = "http://localhost:5000/api";

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  // Validasi password minimal 6 karakter
  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  button.textContent = "Creating account...";
  button.disabled = true;

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        name: email.split("@")[0], // Ambil nama dari email
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Simpan token
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      alert("Account created successfully for " + email);
      form.reset();

      // Redirect ke halaman demo/main
      setTimeout(() => {
        window.location.href = "demo.html";
      }, 1500);
    } else {
      alert("Error: " + data.error);
    }
  } catch (error) {
    alert("Network error: " + error.message);
  } finally {
    button.textContent = "Sign up with email";
    button.disabled = false;
  }
});
