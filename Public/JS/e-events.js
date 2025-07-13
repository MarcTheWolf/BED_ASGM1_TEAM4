const AllEvents = document.getElementById("AllEventsButton")
const RegisteredEvents = document.getElementById("RegisteredEventsButton")



//#region Show All Events


document.addEventListener("DOMContentLoaded", async () => {
    const account_id = localStorage.getItem("account_id")? parseInt(localStorage.getItem("account_id")) : 1;
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const EventsContainer = document.getElementById("AllEventsContainer");

    if (!EventsContainer) {
        console.error("EventsContainer element not found in the DOM.");
        return;
    }

    try {
        const response = await fetch("/getAllEvents", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer "${user.token}"`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Network error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Fetched Events:", data);

        EventsContainer.innerHTML = "";

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(event => {
                // Format date and time for clarity
                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
                const formattedTime = eventDate.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});

                const html = `
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
                        <button class="register-button" data-event-id="${event.id}">Register</button>
                    </div>
                `;
                EventsContainer.innerHTML += html;
            });
        } else {
            EventsContainer.innerHTML = "<p>No events found.</p>";
        }
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        EventsContainer.innerHTML = "<p>Failed to load events. Please try again later.</p>";
    }
});

//#endregion


//#region Show All Events
AllEvents.addEventListener("click", async () => {

    await displayAllEvents();
})

async function displayAllEvents() {
        RegisteredEvents.classList.remove("selected")
    AllEvents.classList.add("selected")

    const EventsContainer = document.getElementById("AllEventsContainer")
    const user = JSON.parse(localStorage.getItem("user")) || {};

    
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
        console.log("Fetched Events:", data);

        EventsContainer.innerHTML = "";

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(event => {
                // Format date and time for clarity
                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
                const formattedTime = eventDate.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});

                const html = `
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
                        <button class="register-button" data-event-id="${event.id}">Register</button>
                    </div>
                `;
                EventsContainer.innerHTML += html;
            });
        } else {
            EventsContainer.innerHTML = "<p>No events found.</p>";
        }
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        EventsContainer.innerHTML = "<p>Failed to load events. Please try again later.</p>";
    }
}

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
        const response = await fetch(`/getEventRegisteredByID/${user.id}`, {
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
                // Format date and time for clarity
                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
                const formattedTime = eventDate.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});

                const html = `
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
                        <button class="unregister-button" data-event-id="${event.id}">Unregister</button>
                    </div>
                `;

                EventsContainer.innerHTML += html;
            });
        } else {
            EventsContainer.innerHTML = "<p>No events found.</p>";
        }
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        EventsContainer.innerHTML = "<p>Failed to load events. Please try again later.</p>";
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