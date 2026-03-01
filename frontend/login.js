const form = document.querySelector("form");
const emailInput = document.querySelector(".input-email");
const passwordInput = document.querySelector(".input-pw");
const button = document.querySelector(".button-sign-up");

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
    const result = await API_CONFIG.fetch(
      "POST",
      API_CONFIG.endpoints.auth.signup,
      {
        email,
        password,
        name: email.split("@")[0],
      },
    );

    if (result.success) {
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));

      alert("Account created successfully for " + email);
      form.reset();

      setTimeout(() => {
        window.location.href = "demo.html";
      }, 1500);
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    alert("Network error: " + error.message);
  } finally {
    button.textContent = "Sign up with email";
    button.disabled = false;
  }
});
