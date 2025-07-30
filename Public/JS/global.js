function autoLogout(response) {
if (response.status = 403) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("user");
        window.location.href = "login.html";
        return;
    }
}
