document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const accountId = user?.id || user?.account_id;

  if (!token || !accountId) {
    alert("You're not logged in. Redirecting to login...");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
    return;
  }

  // Cancel button redirect
  document.querySelector(".cancel-btn").addEventListener("click", () => {
    window.location.href = "e-profile.html";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim(); // optional, not sent
    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender").value;
    const language = document.getElementById("language").value.trim();

    const oldPassword = document.getElementById("oldPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();

    try {
      // Update profile (excluding password)
      const profileRes = await fetch("/updateProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: fullName,
          email: email,
          date_of_birth: dob,
          gender: gender,
          preferred_language: language,
        }),
      });

      const profileData = await profileRes.json();
      if (!profileRes.ok) {
        alert(profileData.error || "Failed to update profile.");
        return;
      }

      console.log(profileData)

      if (oldPassword && newPassword) {
        // Re-authenticate
        const authRes = await fetch("http://localhost:3000/authenticateUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: phone,
            password: oldPassword,
          }),
        });

        const authData = await authRes.json();
        if (!authRes.ok) {
          alert("Old password incorrect. Profile updated but password was not changed.");
          return;
        }

        // Update password
        const passwordRes = await fetch("http://localhost:3000/account/password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword: newPassword }),
        });

        const pwData = await passwordRes.json();
        if (!passwordRes.ok) {
          alert(pwData.error || "Password update failed.");
          return;
        }

        alert("Profile and password updated successfully!");
      } else {
        alert("Profile updated successfully!");
      }

      window.location.href = "e-profile.html";
    } catch (err) {
      console.error("Error during profile update:", err);
      alert("Something went wrong. Please try again.");
    }
  });
});
