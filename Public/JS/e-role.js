document.addEventListener("DOMContentLoaded", function() {
const user = localStorage.getItem("user") 
if (!user) {
    window.location.href = "login.html";
    return;
}

if (user.account_type == "o") {
    window.location.href = "o-home.html";
    return;
} else if (user.account_type == "c") {
    window.location.href = "c-home.html";
    return;
}
});