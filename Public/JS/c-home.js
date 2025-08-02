document.addEventListener("DOMContentLoaded", function () {
  const activitiesContainer = document.getElementById("activities-container");



  activities.forEach((activity) => {
    const card = document.createElement("div");
    card.classList.add("activity-card");
    if (activity.type === "medication") {
      card.classList.add("medication");
    } else if (activity.type === "event") {
      card.classList.add("event");
    }

    card.innerHTML = `
      <div class="activity-left">${activity.name} (${activity.time})</div>
      <div class="activity-right">${activity.location}</div>
    `;

    activitiesContainer.appendChild(card);
  });
});


const chatbtn = document.getElementById("chat-btn");
chatbtn.addEventListener("click", function () {
  window.location.href = "c-chat.html"; // Redirect to chat page
});