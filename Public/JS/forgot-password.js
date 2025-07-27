document.addEventListener("DOMContentLoaded", () => {
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const newPasswordModal = document.getElementById("newPasswordModal");
  const submitNewPasswordBtn = document.getElementById("submitNewPasswordBtn");
  const cancelNewPasswordBtn = document.getElementById("cancelNewPasswordBtn");
  const newPasswordInput = document.getElementById("newPasswordInput");
  const phoneNumberInput = document.getElementById("phone_number");

  // Show modal function
  function showModal() {
    newPasswordModal.style.display = "block";
    forgotPasswordForm.style.display = "none";
  }

  // Hide modal function
  function hideModal() {
    newPasswordModal.style.display = "none";
    forgotPasswordForm.style.display = "block";
    newPasswordInput.value = "";
  }

  // Handle phone number form submission
  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const phoneNumber = phoneNumberInput.value.trim();

  //New Validation: Must be 8 digits and numbers only
    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      alert("Please enter a valid 8-digit phone number.");
      return;
    }

    // Call backend to check phone number existence 
    try {
      // Optionally can call an endpoint here to verify phone number first, (if got time)
      // but assuming forgot-password API checks phone and updates in one call, 
      // we just show modal here for user to enter new password.
      showModal();
    } catch (error) {
      alert("Failed to verify phone number. Please try again.");
      console.error(error);
    }
  });

  // Handle new password submit button
  submitNewPasswordBtn.addEventListener("click", async () => {
    const newPassword = newPasswordInput.value.trim();
    const phoneNumber = phoneNumberInput.value.trim();

    if (!newPassword) {
      alert("Please enter a new password.");
      return;
    }

    // Add new password validation here:
  if (newPassword.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
  }

    if (!phoneNumber) {
      alert("Phone number missing. Please start over.");
      hideModal();
      return;
    }

    try {
      const response = await fetch("/account/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          newPassword: newPassword,
        }),
      });

      if (response.ok) {
        alert("Password reset successfully! You can now log in with your new password.");
        hideModal();
        forgotPasswordForm.reset();
        window.location.href = "login.html"; // redirect after success
      } else {
        const data = await response.json();
        alert(data.error || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      alert("Error contacting server. Please try again.");
      console.error(error);
    }
  });

  // Handle cancel button
  cancelNewPasswordBtn.addEventListener("click", () => {
    hideModal();
  });

  // Hide modal if user clicks outside the modal content
  window.addEventListener("click", (event) => {
    if (event.target === newPasswordModal) {
      hideModal();
    }
  });
});


