document.addEventListener("DOMContentLoaded", function () {
  const activitiesContainer = document.getElementById("activities-container");

  // Example activity data
  const activities = [
    {
      type: "medication",
      name: "Andy Ng",
      time: "8:30",
      location: "Gaylang Rd Singapore128824",
    },
    {
      type: "event",
      name: "John Ong",
      time: "12:30",
      location: "Clementy Rd Singapore205138",
    },
    {
      type: "event",
      name: "Jie Zhang",
      time: "14:30",
      location: "Niko Rd Singapore133782",
    },
  ];

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
