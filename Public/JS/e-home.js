
var medicationData = [];
var eventData = [];
const user = JSON.parse(localStorage.getItem("user")); // Parse the stored user JSON

document.addEventListener("DOMContentLoaded", async function () {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if (user.account_type == "o") {
        window.location.href = "e-events.html";
        return;
    } else if (user.account_type == "c") {
        window.location.href = "c-home.html";
        return;
    }

    console.log(localStorage.getItem("user"));
    medicationData = await fetchMedicationData();
    eventData = await fetchEventData();
    await getFinanceBarChart();
    await consolidateAndDisplayActivities();
    activityClicks();
});

function autoLogout(response) {
if (response.status === 403) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("user");
        window.location.href = "login.html";
        return;
    }
}

async function fetchMedicationData() {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await fetch(`/getMedicationByAccountID`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`
        }
        });
        if (!response.ok) {
            autoLogout(response);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching medication data:", error);
        return [];
    }
}

async function fetchEventData() {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await fetch(`/getEventRegisteredByID`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`
        }
        });
        if (!response.ok) {
            autoLogout(response);
            const errText = await response.text();
            console.error("Failed to fetch event data:", errText);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching event data:", error);
        return [];
    }
}

async function getFinanceBarChart() {
  const userRaw = localStorage.getItem("user");

  if (!userRaw) {
    console.error("User not found in localStorage.");
    return;
  }

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    return;
  }

  if (!user.id || !user.token) {
    console.error("User object is missing 'id' or 'token':", user);
    return;
  }

  try {
    const response = await fetch(`/getExpenditureByMonthBarChart/${user.id}`, {
      headers: {
        "Authorization": `Bearer ${user.token}`
      }
    });

    if (!response.ok) {
    autoLogout(response);
      const errText = await response.text();
      console.error("Failed to fetch chart URL:", errText);
      return;
    }

    const result = await response.json();
    const chartImg = document.getElementById("spending-chart");

    if (chartImg && result.chartUrl) {
      chartImg.src = result.chartUrl;
    } else {
      console.error("Chart image element or chartUrl missing.");
    }
  } catch (error) {
    console.error("Error fetching monthly expenditure chart:", error);
  }
}


async function consolidateAndDisplayActivities() {
    if (!medicationData || !eventData) return;

    const dateMap = {};
    const today = new Date();
    const todayKey = formatDateKey(today);
    const rangeDays = 1;

    const displayDates = Array.from({ length: rangeDays }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return formatDateKey(d);
    });

    // Initialize dateMap
    displayDates.forEach(date => {
        dateMap[date] = [];
    });

for (const med of medicationData) {
    if (!med.start_date) continue;

    const freq = med.frequency;
    const startDate = new Date(med.start_date);

    if (freq === 'D') {
        displayDates.forEach(dateStr => {
            const targetDate = new Date(dateStr);
            if (shouldIncludeDate(startDate, targetDate, freq)) {
                dateMap[dateStr].push({
                    type: 'medication',
                    time: med.time || '',
                    name: med.name,
                    dosage: med.dosage,
                    id: med.med_id
                });
            }
        });
    }

    // 🔁 NEW: Fetch and process weekly timings
    else if (freq === 'W') {
        const res = await fetch(`/getWeeklyTiming/${med.med_id}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            }
        });

        if (!res.ok) {
            autoLogout(res);
            console.warn(`Failed to fetch weekly timing for med ${med.name}`);
            continue;
        }

        const timings = await res.json(); // [{ day: 1, time: "14:00" }, ...]

        for (const { day, time } of timings) {
            displayDates.forEach(dateStr => {
                const targetDate = new Date(dateStr);
                if (targetDate.getDay() === (day % 7)) { // JS Sunday=0, SQL Sunday=7
                    dateMap[dateStr].push({
                        type: 'medication',
                        time: time,
                        name: med.name,
                        dosage: med.dosage,
                        id: med.med_id
                    });
                }
            });
        }
    }

    // Skip WR or any others
}

    // Add events
    eventData.forEach(event => {
        if (!event.date) return;
        const freq = event.weekly ? 'W' : 'O';
        const startDate = new Date(event.date);

        displayDates.forEach(dateStr => {
            const targetDate = new Date(dateStr);
            if (shouldIncludeDate(startDate, targetDate, freq)) {
                dateMap[dateStr].push({
                    type: 'event',
                    time: event.time || '',
                    name: event.name,
                    id: event.id,
                    location: event.location
                });
            }
        });
    });

    // Render to UI
    const container = document.querySelector(".activities");

    container.innerHTML = `<h2 class="section-header">Activities</h2>`;

    displayDates.forEach(dateStr => {
        const isToday = dateStr === todayKey;
        const activities = dateMap[dateStr];

        const dateHeader = document.createElement("div");
        dateHeader.classList.add("date-tag");
        const formattedDate = isToday ? "Today" : formatDate(dateStr);
        dateHeader.innerHTML = isToday ? `${formattedDate} <span>🔔</span>` : formattedDate;
        container.appendChild(dateHeader);

        if (!activities || activities.length === 0) {
            if (isToday) {
                const empty = document.createElement("p");
                empty.textContent = "No activities today.";
                empty.style.paddingLeft = "10px";
                container.appendChild(empty);
            }
            return;
        }

        activities
            .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
            .forEach(item => {
                const entry = document.createElement("div");
                entry.classList.add("activity");

                if (isToday && isTimePast(item.time)) {
                    entry.classList.add("past");
                    entry.title = "This activity has passed.";
                }

                if (item.type === "medication") {
                    entry.classList.add("medication");
                    entry.setAttribute("data-type", "m");
                    entry.setAttribute("data-ID", item.id);
                    entry.innerHTML = `
                        <p><strong>Medication Time (${formatTime(item.time)})</strong></p>
                        <p>${item.name} (${item.dosage})</p>
                    `;

                
                } else if (item.type === "event") {
                    entry.classList.add("event");
                    entry.setAttribute("data-type", "e");
                    entry.setAttribute("data-ID", item.id || '');
                    entry.innerHTML = `
                        <p><strong>Upcoming Event (${formatTime(item.time)})</strong></p>
                        <p>${item.name} @ ${item.location}</p>
                    `;
                    
                }


                container.appendChild(entry);
            });
    });
}

function shouldIncludeDate(start, target, freq) {
    if (target < start) return false;

    switch (freq) {
        case 'D': return true;
        case 'WR': return false; // only manual
        case 'O': return start.toDateString() === target.toDateString();
        default: return false;
    }
}

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatTime(timeString) {
    if (!timeString) return 'No time';

    if (timeString.includes("T")) {
        const [hours, minutes] = timeString.split("T")[1].split(":");
        return `${hours}:${minutes}`;
    }

    const parts = timeString.split(":");
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
}

function isTimePast(timeStr) {
    if (!timeStr) return false;

    let hours = 0, minutes = 0;

    if (timeStr.includes("T")) {
        [hours, minutes] = timeStr.split("T")[1].split(":").map(Number);
    } else {
        [hours, minutes] = timeStr.split(":").map(Number);
    }

    const now = new Date();
    const compareTime = new Date();
    compareTime.setHours(hours, minutes, 0, 0);

    return now > compareTime;
}


async function activityClicks() {
    var medicationItems = document.querySelectorAll(".medication")
    var eventItems = document.querySelectorAll(".event");


    medicationItems.forEach(item => {
        item.addEventListener("click",  async function (e) {
            const item = e.currentTarget;
            const medId = item.getAttribute("data-ID");
            var medData

            await fetch(`/getMedicationByID/${medId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            }
            })
            .then(response => {
                if (!response.ok) {
                    autoLogout(response);
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    console.log("Medication data:", data);
                    medData = data;
                } else {
                    console.error("Medication data not found.");
                }
            })

            if (medData) {

            }
        });
    });
    
    eventItems.forEach(item => {
        item.addEventListener("click", async function (e) {
            const item = e.currentTarget;
            const eventId = item.getAttribute("data-ID");
            var eventData;

            await fetch(`/getEventDetailsByID/${eventId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    autoLogout(response);
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    console.log("Event data:", data);
                    eventData = data;
                } else {
                    console.error("Event data not found.");
                }
            })

            if (eventData) {

            }
        });
    });
}

