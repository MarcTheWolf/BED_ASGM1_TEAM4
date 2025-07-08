
var medicationData = [];
var eventData = [];

document.addEventListener("DOMContentLoaded", async function () {
    const user = JSON.parse(localStorage.getItem("user"));
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

    console.log(localStorage.getItem("user"));
    medicationData = await fetchMedicationData();
    eventData = await fetchEventData();
    await getFinanceBarChart();
    consolidateAndDisplayActivities();
    activityClicks();
});

async function fetchMedicationData() {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await fetch(`/getMedicationByAccountID/${user.id}`);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error fetching medication data:", error);
        return [];
    }
}

async function fetchEventData() {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await fetch(`/getEventRegisteredByID/${user.id}`);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("Error fetching event data:", error);
        return [];
    }
}

async function getFinanceBarChart() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
        console.error("User not found in localStorage.");
        return;
    }

    try {
        // Fetch monthly expenditure breakdown
        const response = await fetch(`/getMonthlyExpenditureByID/${user.id}`);
        const data = await response.json();
        console.log("Monthly expenditure data:", data);

        if (!Array.isArray(data)) {
            console.error("Invalid data format:", data);
            return;
        }

        // 🔽 Sort by date and get the last 5 months
        const recentData = data
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-6);

        // Convert '2025-04' → 'April' Conver Date number format to name string
        const monthLabels = recentData.map(entry => {
            const [year, month] = entry.month.split('-');
            return new Date(`${year}-${month.padStart(2, '0')}-01`).toLocaleString('default', { month: 'long' });
        });

        const amounts = recentData.map(entry => entry.total);

        // Compute Y-axis scale
        const minValue = Math.min(...amounts);
        const maxValue = Math.max(...amounts);
        const yMin = Math.max(0, Math.floor(minValue * 0.8)); // extra bottom space

        // Color gradient based on value (lower = lighter, but not too light)
        const getShade = (value) => {
            const ratioLinear = (value - minValue) / (maxValue - minValue || 1);
            const easedRatio = Math.pow(ratioLinear, 2.5); // less dark in middle

            const lightBase = 200;
            const darkBase = 40;

            const shade = Math.floor(lightBase - (lightBase - darkBase) * easedRatio);
            return `rgb(${shade}, ${shade + 20}, ${shade + 50})`;
        };

        const backgroundColors = amounts.map(getShade);

        const chartData = {
            type: 'bar',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Monthly Expenditure (S$)',
                    data: amounts,
                    backgroundColor: backgroundColors,
                    borderRadius: 20,
                    borderSkipped: false // allows full bar rounding
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Spending Overview (Last 5 Months)'
                    },
                    legend: {
                        display: false
                    }
                },
                layout: {
                    padding: {
                        bottom: 10
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: yMin,
                        max: Math.ceil(maxValue * 1.05),
                        title: {
                            display: true,
                            text: 'Amount (S$)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                }
            }
        };

        const chartUrl = 'https://quickchart.io/chart?c=' + encodeURIComponent(JSON.stringify(chartData)) + '&version=3';
        const chartImg = document.getElementById('spending-chart');

        if (chartImg) {
            chartImg.src = chartUrl;
        } else {
            console.error('Element with id="spending-chart" not found');
        }

    } catch (error) {
        console.error("Error fetching monthly expenditure data:", error);
    }
}


function consolidateAndDisplayActivities() {
    if (!medicationData || !eventData) return;

    const dateMap = {};
    const today = new Date();
    const todayKey = formatDateKey(today);
    const rangeDays = 3;

    const displayDates = Array.from({ length: rangeDays }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return formatDateKey(d);
    });

    // Initialize dateMap
    displayDates.forEach(date => {
        dateMap[date] = [];
    });

    medicationData.forEach(med => {
        if (!med.start_date) return;
        const freq = med.frequency;
        const startDate = new Date(med.start_date);

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
    });

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
                    console.log(entry.getAttribute("data-ID"));

                
                } else if (item.type === "event") {
                    entry.classList.add("event");
                    entry.setAttribute("data-type", "e");
                    entry.setAttribute("data-ID", item.id || '');
                    entry.innerHTML = `
                        <p><strong>Upcoming Event (${formatTime(item.time)})</strong></p>
                        <p>${item.name} @ ${item.location}</p>
                    `;
                    console.log(entry.getAttribute("data-ID"));
                    
                }


                container.appendChild(entry);
            });
    });
}

function shouldIncludeDate(start, target, freq) {
    if (target < start) return false;

    switch (freq) {
        case 'D': return true;
        case 'W': return start.getDay() === target.getDay();
        case 'M': return start.getDate() === target.getDate();
        case 'WR': return false;
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

            await fetch(`/getMedicationByID/${medId}`)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
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

            await fetch(`/getEventDetailsByID/${eventId}`)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
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

