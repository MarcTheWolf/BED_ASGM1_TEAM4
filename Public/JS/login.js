const register = document.querySelector(".registerbtn")
register.addEventListener("click", function() {
    document.querySelector(".left-slider").classList.add("register")
    document.querySelector(".right-slider").classList.add("register")
    document.querySelector(".signin-text").classList.add("move")
    document.querySelector(".register-text").classList.remove("move")
})

const signin = document.querySelector(".signinbtn")
signin.addEventListener("click", function() {
    document.querySelector(".left-slider").classList.remove("register")
    document.querySelector(".right-slider").classList.remove("register")
    document.querySelector(".signin-text").classList.remove("move")
    document.querySelector(".register-text").classList.add("move")
})


document.addEventListener("DOMContentLoaded", function() {
    const user = localStorage.getItem("user");
    if (user || user !== null) {
        window.location.href = "e-home.html";
    }
    return;
});


//Login Functionality
const loginbtn = document.querySelector(".login-btn");
loginbtn.addEventListener("click", async function (e) {
    e.preventDefault();

    const phone_number = document.querySelector("#login_phone_number").value;
    const password = document.querySelector("#login_password").value;

    if (!phone_number || !password) {
        alert("Please fill in both phone number and password.");
        return;
    }
    const user = { phone_number, password };

    await fetch("/authenticateUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    .then(res => res.json())
    .then(data => {
        if (data.account_id) {
            localStorage.setItem("account_id", data.account_id);
            var account_id = data.account_id;
            var token = data.token;
            console.log("Token:", token);
            alert("Login successful!");
            console.log("User logged in:", data.account_id);

            fetch(`/getAccountById`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => {
                if (!res.ok) {
                throw new Error("Failed to fetch user details.");
                }
                return res.json();
            })
            .then(userDetails => {
                userDetails.token = token;
                localStorage.setItem("user", JSON.stringify(userDetails));
                console.log("User details:", userDetails);
                window.location.href = "e-home.html";
            })
            .catch(err => {
                console.error("Error fetching user details:", err);
                alert("Error fetching user details. Please try again later.");
            });
        } else if (data.error) {
            alert(data.error);
        } else {
            alert("Unknown error occurred.");
        }
    })
    .catch(err => {
        console.error("Login error:", err);
        alert("Server error. Please try again later.");
    });
});



const registerbtn = document.querySelector(".register-btn");

registerbtn.addEventListener("click", async function (e) {
    e.preventDefault();

    const phone_number = document.querySelector("#register_phone_number").value;
    const password = document.querySelector("#register_password").value;
    const confirm_password = document.querySelector("#register_cfpassword").value;

    if (!phone_number || !password) {
        alert("Please fill in both phone number and password.");
        return;
    }

    if (!confirm_password) {
        alert("Please confirm your password.");
        return;
    }

    if (password !== confirm_password) {
        alert("Passwords do not match.");
        return;
    }

    const newUser = { phone_number, password };

    localStorage.setItem("newUser", JSON.stringify(newUser));
    window.location.href = "register.html";
});