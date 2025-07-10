const accountButtons = document.querySelectorAll(".account-btn");
const accountTypeForm = document.getElementById("account-type-form");
const personalInfoForm = document.getElementById("personal-info-form");
const backButton = document.getElementById("backToAccountType");


accountButtons.forEach(btn => {
    btn.addEventListener("click", () => {
    const type = btn.getAttribute("data-type");
    localStorage.setItem("account_type", type);
    console.log(`Account type set to: ${type}`);
    accountTypeForm.classList.add("hidden");
    personalInfoForm.classList.remove("hidden");
    });
});

backButton.addEventListener("click", () => {
    personalInfoForm.classList.add("hidden");
    accountTypeForm.classList.remove("hidden");
});


document.getElementById("profileForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const profileData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    gender: document.getElementById("gender").value,
    date_of_birth: document.getElementById("dob").value,
    preferred_language: document.getElementById("language").value,
    account_type: localStorage.getItem("account_type")
    };
    console.log("Profile Data:", profileData);
    const newUserAccount = localStorage.getItem("newUser");
    console.log("New User Account:", newUserAccount);
    if (newUserAccount) {
        const newUserId = await createAccount(newUserAccount)
        console.log("New User ID:", newUserId);
        await fetch(`/initializeAccountDetails/${newUserId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(profileData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Account created successfully!");
                window.location.href = "index.html";
            } else {
                alert("Error initializing account details: " + data.error);
            }
        })
    } else {
        alert("No user data found. Please fill out the registration form again.");
        window.location.href = "login.html";
    }
});


async function createAccount(user) {
    try {
        const res = await fetch("/createAccount", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: user
        });
        const data = await res.json();
        console.log("Response from createAccount:", data);
        if (data.account_id) {
            console.log("User registered:", data.account_id);
            return data.account_id;
        } else if (data.error) {
            alert(data.error);
            return null;
        } else {
            alert("Unknown error occurred.");
            return null;
        }
    } catch (err) {
        console.error("Registration error:", err);
        alert("Server error. Please try again later.");
        return null;
    }
}