document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const accountId = user?.id || user?.account_id;

  const phone_number = fetch("/getPhoneByAccountID", {
    method: "GET",
    
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  } ).then(res => {
    if (!res.ok) {
      throw new Error("Failed to fetch phone number");
    }
    return res.json();
  }).then(data => {
    const phoneInput = document.getElementById("phone");
    phoneInput.value = data.phone_number || "";
  }).catch(err => {
    console.error("Error fetching phone number:", err);
    alert("Failed to fetch phone number. Please try again later.");
  });

    const fullName = document.getElementById("fullname")
    const email = document.getElementById("email")
    const phone = document.getElementById("phone")
    const dob = document.getElementById("dob")
    const gender = document.getElementById("gender")
    const language = document.getElementById("language")
    console.log("User data:", user);

    if (user) {

      const date = new Date(user.date_of_birth);

const yyyy = date.getFullYear();
const mm = String(date.getMonth() + 1).padStart(2, '0');
const dd = String(date.getDate()).padStart(2, '0');

const formatted = `${yyyy}-${mm}-${dd}`; // --> "1965-03-16"

      console.log("Populating form with user data:", user);
      fullName.value = user.name || "";
      email.value = user.email || "";
      phone.value = user.phone_number || ""; // optional, not sent
      dob.value = formatted ? formatted : 'Unknown';
      gender.value = user.gender || "";
      language.value = user.preferred_language || "";
    }

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

      const phoneNumberRes = await fetch("/updatePhoneNumber", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          newPhoneNumber: phone,
        }),
      });


      const phoneNumberData = await phoneNumberRes.json();
      const profileData = await profileRes.json();
      if (!profileRes.ok || !phoneNumberRes.ok) {
        alert(profileData.error || "Failed to update profile.");
        return;
      }


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
});document.addEventListener("DOMContentLoaded", () => {
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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};