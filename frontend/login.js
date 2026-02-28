
const form = document.querySelector("form");
const emailInput = document.querySelector(".input-email");
const passwordInput = document.querySelector(".input-pw");
const button = document.querySelector(".button-sign-up");


form.addEventListener("submit", function (e) {
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

  setTimeout(() => {
    alert("Account created successfully for " + email);
    button.textContent = "Sign up with email";
    button.disabled = false;
    form.reset();
  }, 1500);
});
