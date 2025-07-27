const AllEvents = document.getElementById("AllEventsButton")
const RegisteredEvents = document.getElementById("RegisteredEventsButton")
const addEventButton = document.getElementById("addEventButton");


//#region Show All Events


document.addEventListener("DOMContentLoaded", async () => {
    const account_id = localStorage.getItem("account_id")? parseInt(localStorage.getItem("account_id")) : 1;
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const EventsContainer = document.getElementById("AllEventsContainer");

    if (!EventsContainer) {
        console.error("EventsContainer element not found in the DOM.");
        return;
    }

    if (user.account_type === "o") {
        addEventButton.hidden = false; // Show add event button for organizers
        RegisteredEvents.hidden = true; // Hide registered events button for organizers
    }
    else {
        addEventButton.hidden = true; // Hide add event button for non-organizers
        RegisteredEvents.hidden = false; // Show registered events button for non-organizers
        }

    await displayAllEvents();
});

//#endregion


//#region Show All Events
AllEvents.addEventListener("click", async () => {

    await displayAllEvents();
})

async function displayAllEvents() {
    RegisteredEvents.classList.remove("selected")
    AllEvents.classList.add("selected")
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const EventsContainer = document.getElementById("AllEventsContainer")

    if (!user) {
        console.error("User data not found in localStorage.");
        return;
    }

    if (!EventsContainer) {
        console.error("EventsContainer element not found in the DOM.");
        return;
    }

    try {
        const response = await fetch("/getAllEvents", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token || ""}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Network error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        window.allEvents = data;
        console.log("Fetched Events:", data);


        EventsContainer.innerHTML = "";

            if (Array.isArray(data) && data.length > 0) {
                data.forEach(event => {
                    const html = renderEvent(event, user.account_type, "view");
                    EventsContainer.innerHTML += html;
                });
            } else {
                EventsContainer.innerHTML = "<p>No events found.</p>";
            }
        
        
        }
    catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        EventsContainer.innerHTML = "<p>There are currently no events. Please try again later.</p>";
    }
};

//#endregion

//#region Show Registered Events
RegisteredEvents.addEventListener("click", async (event) => {
    await displayRegistered();
});

async function displayRegistered() {
        AllEvents.classList.remove("selected")
    RegisteredEvents.classList.add("selected")
    
    const account_id = localStorage.getItem("account_id") ? parseInt(localStorage.getItem("account_id")) : 1;
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const EventsContainer = document.getElementById("AllEventsContainer")
    if (!EventsContainer) {
        console.error("EventsContainer element not found in the DOM.");
        return;
    }

    try {
        const response = await fetch(`/getEventRegisteredByID`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token || ""}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Network error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Fetched Registered Events:", data);

        EventsContainer.innerHTML = "";

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(event => {
                const html = renderEvent(event, user.account_type, "registered");
                EventsContainer.innerHTML += html;

            });
        } else {
            EventsContainer.innerHTML = "<p>No events found.</p>";
        }
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        EventsContainer.innerHTML = "<p>There are currently no events. Please try again later.</p>";
    }
}
//#endregion


document.getElementById("EventsContainer").addEventListener("click", async function (event) {
  if (event.target.classList.contains("unregister-button")) {
    const button = event.target;
    const eventId = button.getAttribute("data-event-id");

    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;
    const accId = user?.id;

    if (!token || !accId) {
      alert("You must be logged in to unregister.");
      return;
    }

    try {
      const response = await fetch(`/unregisterEvent/${eventId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${token}`
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert("Successfully unregistered from the event.");
        document.getElementById(`event-${eventId}`).remove();
      } else {
        alert(result.message || "Unregister failed.");
      }
    } catch (error) {
      console.error("Unregister error:", error);
      alert("Something went wrong.");
    }
  }
});


document.getElementById("EventsContainer").addEventListener("click", async function (event) {
  if (event.target.classList.contains("register-button")) {
    const button = event.target;
    const eventId = button.getAttribute("data-event-id");

    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;
    const accId = user?.id;

    if (!token || !accId) {
      alert("You must be logged in to register.");
      return;
    }

    try {
      const response = await fetch(`/registerEvent/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${token}`
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert("Successfully registered for the event.");
        // Optional: change button text or disable it
      } else {
        alert(result.message || "Failed to register.");
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("An error occurred during registration.");
    }
  }
});


function renderEvent(event, userRole, view){
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
    const formattedTime = eventDate.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});

    let actionButton = "";
    if (view === "registered") {
        actionButton = `<button class="unregister-button" data-event-id="${event.id}">Unregister</button>`;
    } else if (userRole === "o") {
        actionButton = `<button class="edit-button" data-event-id="${event.id}">Edit event</button>`;
    } else if (userRole === "e" || userRole === "c") {
        actionButton = `<button class="register-button" data-event-id="${event.id}">Register</button>`;
    }

     return `
        <div class="event-card" id="event-${event.id}">
            <div class="event-image">
                <img src="${event.banner_image || "Assets/logo.png"}" alt="placeholder image">
            </div>
            <div class="event-details">
                <h2>${event.name}</h2>
                <p>Date: ${formattedDate}</p>
                <p>Time: ${formattedTime}</p>
                <p>Location: ${event.location}</p>
            </div>
            ${actionButton}
        </div>
    `;
}



document.addEventListener("click", function (e) {
    const card = e.target.closest(".event-card");
    const isButton = e.target.classList.contains("register-button") || 
                     e.target.classList.contains("unregister-button") || 
                     e.target.classList.contains("edit-button");

    if (card && !isButton) {
        const eventId = card.id.replace("event-", "");
        const event = window.allEvents?.find(ev => ev.id == eventId);
        if (event) {
            showEventModal(event);
        }
    }
});

function showEventModal(event) {
    const modal = document.getElementById("eventModal");
    document.getElementById("modalName").textContent = event.name;
    document.getElementById("modalDescription").textContent = event.description || "N/A";
    document.getElementById("modalDate").textContent = new Date(event.date).toLocaleDateString();
    document.getElementById("modalTime").textContent = new Date(event.date).toLocaleTimeString();
    document.getElementById("modalLocation").textContent = event.location || "N/A";
    document.getElementById("modalWeekly").textContent = event.weekly ? "Yes" : "No";
    document.getElementById("modalEquipment").textContent = event.equipment_required || "None";
    document.getElementById("modalImage").src = event.banner_image || "Assets/logo.png";

    modal.classList.add("show");
}

document.getElementById("modalClose").addEventListener("click", () => {
    document.getElementById("eventModal").classList.remove("show");
});

//#region Add Event
// Add Event Modal
const addEventModal = document.getElementById("addEventModalBackdrop");
const closeAddEventModal = document.getElementById("closeAddEventModal");

addEventButton.addEventListener("click", function () {
    addEventModal.classList.remove("hidden");
});

closeAddEventModal.addEventListener("click", function () {
    addEventModal.classList.add("hidden");
});

document.getElementById("addEventForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    var user = JSON.parse(localStorage.getItem("user")) || {};

    const formData = {
        name: form.name.value,
        description: form.description.value,
        date: form.date.value,
        time: form.time.value,
        location: form.location.value,
        equipment_required: form.equipment_required.value,
        weekly: form.weekly.checked,
        org_id: user.id
    };
    console.log("Form Data:", formData);
    try {
        const response = await fetch("/createEvent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(err);
        }

        alert("Event created successfully!");
        addEventModal.classList.add("hidden");
        form.reset();
        await displayAllEvents(); // Refresh list
    } catch (err) {
        console.error("Failed to create event:", err);
        alert("Failed to create event.");
    }
});


//#endregion

//#region Edit Event Modal

const editEventModal = document.getElementById("editEventModalBackdrop");
const closeEditEventModal = document.getElementById("closeEditEventModal");
const editEventForm = document.getElementById("editEventForm");

document.addEventListener("click", function (e) {
    const editBtn = e.target.closest(".edit-button");
    if (editBtn) {
        const eventId = editBtn.dataset.eventId;
        const event = window.allEvents?.find(ev => ev.id == eventId);
        if (event) {
            console.log("Opening modal for event", event);
            openEditEventModal(event);
        } else {
            console.warn("Event not found for ID:", eventId);
        }
    }
});

function openEditEventModal(event) {

    editEventForm.id.value = event.id;
    editEventForm.name.value = event.name;
    editEventForm.description.value = event.description;
    editEventForm.date.value = event.date;
    editEventForm.time.value = event.time;
    editEventForm.location.value = event.location;
    editEventForm.weekly.checked = !!event.weekly;

    editEventModal.classList.remove("hidden");
}

closeEditEventModal.addEventListener("click", function () {
    editEventModal.classList.add("hidden");
});

editEventModal.addEventListener("click", function (e) {
    if (e.target === editEventModal) {
        editEventModal.classList.add("hidden");
    }
});

editEventForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const formData = {
        id: editEventForm.id.value,
        name: editEventForm.name.value,
        description: editEventForm.description.value,
        date: editEventForm.date.value,
        time: editEventForm.time.value,
        location: editEventForm.location.value,
        equipment_required: editEventForm.equipment_required.value,
        banner_image: editEventForm.banner_image.value,
        weekly: editEventForm.weekly.checked,
        org_id: user.id
    };

    try {
        const response = await fetch(`/updateEvent/${formData.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error("Failed to update event");

        alert("Event updated.");
        editEventModal.classList.add("hidden");
        await displayAllEvents();
    } catch (err) {
        console.error(err);
        alert("Update failed.");
    }
});




















