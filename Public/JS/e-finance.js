const addTransBtn = document.getElementById("add-transaction-btn");
const formContainer = document.querySelector(".form-container-transaction");
const form = document.getElementById("transaction-form");


addTransBtn.addEventListener("click", function() {
    formContainer.hidden = !formContainer.hidden;

    if (!formContainer.hidden) {
        form.reset();
    }
});

const addRecordButton = document.querySelector(".add-record-button");


const openBudgetBtn = document.getElementById('open-budgetform-btn');
const cancelBudgetBtn = document.getElementById('cancel-budget');
const budgetformContainer = document.getElementById("form-container-budget");
const budgetForm = document.getElementById("budget-form");
const saveBudgetBtn = document.getElementById("save-budget");
const cancelTransactionBtn = document.getElementById("cancel-transaction");

cancelTransactionBtn.addEventListener("click", function() {
    formContainer.hidden = true;
    form.reset();
});



openBudgetBtn.addEventListener("click", function() {
    budgetformContainer.hidden = false;
    loadForm();
});

cancelBudgetBtn.addEventListener("click", function() {
    budgetformContainer.hidden = true;
    budgetForm.reset();
});

async function loadForm() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("You must be logged in to set a budget.");
    return;
  }

  const month = new Date().toLocaleDateString('sv-SE').slice(0, 7); // 'YYYY-MM'
  console.log("Loading budget form for month:", month);

  const res = await fetch(`/getExpenditurePerCategoryMonth/${month}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${user.token}`
    }
  });

  const data = await res.json();
  
if (res.ok) {
  console.log("Budget data loaded:", data);

  // Convert array to a category -> goal map
  const categoryMap = {};
  for (const entry of data) {
    const key = entry.category.toLowerCase(); // normalize to lowercase
    categoryMap[key] = entry.monthly_goal;
  }

  document.getElementById("food-budget").value = categoryMap.food || '';
  document.getElementById("transport-budget").value = categoryMap.transport || '';
  document.getElementById("utilities-budget").value = categoryMap.utilities || '';
  document.getElementById("other-budget").value = categoryMap.others || '';

  console.log("Loaded budget form with data:", categoryMap);
} else {
  console.error("Error fetching expenditure goal:", data);
}
}


document.addEventListener("DOMContentLoaded", async function() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    await populateMonthDropdown(); //  Add this line
    now = new Date();
        const date = new Date(now.getFullYear(), now.getMonth(), 1);
        const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed

    const yearMonth = `${year}-${month}`; // 'YYYY-MM'
        await updateTransactionRecords(user, yearMonth); // Existing
    await displayBudgetExpenditurePieChart(user, yearMonth); // Existing
    await displayBarCharts(user, yearMonth); // Existing
  }
});


async function updateTransactionRecords(user, selectedMonth = null) {
  const container = document.querySelector('.transaction-records-list');
  container.innerHTML = '';

  try {
    const endpoint = selectedMonth
      ? `/getTransactionsByMonth/${selectedMonth}`
      : `/getAllTransactionsByID`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${user.token}`
      }
    });

    const data = await response.json();

    // Group by month & render (existing logic)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    const grouped = {};

    data.forEach(record => {
      const date = new Date(record.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

      if (!grouped[monthYear]) grouped[monthYear] = [];
      grouped[monthYear].push(record);
    });

    for (const [monthYear, records] of Object.entries(grouped)) {
      const header = document.createElement('div');
      header.className = 'transaction-month-header';
      header.textContent = monthYear;
      container.appendChild(header);

      records.forEach(record => {
        const recordDiv = document.createElement('div');
        recordDiv.className = 'transaction-record';
        recordDiv.setAttribute('data-id', record.entry_id);
        recordDiv.innerHTML = `
          <span class="transaction-date">${formatDate(record.date)}</span>
          <span class="transaction-category">${record.cat}</span>
          <span class="transaction-description">${record.description}</span>
          <span class="transaction-amount">$${parseFloat(record.amount).toFixed(2)}</span>
        `;
        container.appendChild(recordDiv);
      });
    }

  } catch (error) {
    console.error("Error updating transaction records:", error);
  }
}
const grouped = {};

    // Append to DOM
    for (const [monthYear, records] of Object.entries(grouped)) {
      const header = document.createElement('div');
      header.className = 'transaction-month-header';
      header.textContent = monthYear;
      container.appendChild(header);

      records.forEach(record => {
        const recordDiv = document.createElement('div');
        recordDiv.className = 'transaction-record';
        recordDiv.setAttribute('data-id', record.entry_id); // Store record ID for future reference
        recordDiv.innerHTML = `
          <span class="transaction-date">${formatDate(record.date)}</span>
          <span class="transaction-category">${record.cat}</span>
          <span class="transaction-description">${record.description}</span>
          <span class="transaction-amount">$${parseFloat(record.amount).toFixed(2)}</span>
        `;
        container.appendChild(recordDiv);
      });
    }



async function displayBudgetExpenditurePieChart(user, selectedMonth = null) {
  const month = selectedMonth || new Date().toISOString().slice(0, 7); // fallback to current month

  const container = document.querySelector('.finance-pie-chart');

  try {
    const response = await fetch(`/getBudgetExpenditureDoughnutChart/${month}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${user.token}`
      }
    });

    const data = await response.json();
    container.src = data.chartUrl;

  } catch (error) {
    console.error("Chart error:", error);
  }
}

async function displayBarCharts(user, selectedMonth = null) {
  const month = selectedMonth || new Date().toISOString().slice(0, 7); // fallback to current month

  const container = document.querySelector('#transport-bar');
  const textContainer = document.querySelector('#transport-data');

  const foodContainer = document.querySelector('#food-bar');
  const foodTextContainer = document.querySelector('#food-data');

  const utilitiesContainer = document.querySelector('#utilities-bar');
  const utilitiesTextContainer = document.querySelector('#utilities-data');

      const otherContainer = document.querySelector('#others-bar');
    const otherTextContainer = document.querySelector('#others-data');

  try {
    const response = await fetch(`/transportBarChart/${month}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${user.token}`
      }
    });

    const data = await response.json();
    container.src = data.chartUrl;
    textContainer.textContent = `$${data.spent}/${data.goal}`;


  } catch (error) {
    console.error("Chart error:", error);
  }

  try {
    const response = await fetch(`/getFoodBarChart/${month}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${user.token}`
      }
    });
    const data = await response.json();
    foodContainer.src = data.chartUrl;
    foodTextContainer.textContent = `$${data.spent}/${data.goal}`;
  } catch (error) {
    console.error("Food chart error:", error);
  }

  try {
    const response = await fetch(`/getUtilityBarChart/${month}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${user.token}`
      }
    });
    const data = await response.json();
    utilitiesContainer.src = data.chartUrl;
    utilitiesTextContainer.textContent = `$${data.spent}/${data.goal}`;
  } catch (error) {
    console.error("Utilities chart error:", error);
  }

  try {
    const response = await fetch(`/getOtherBarChart/${month}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${user.token}`
      }
    });
    const data = await response.json();
    otherContainer.src = data.chartUrl;
    otherTextContainer.textContent = `$${data.spent}/${data.goal}`;
  } catch (error) {
    console.error("Other chart error:", error);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('default', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

document.getElementById("transaction-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const user = JSON.parse(localStorage.getItem("user")); // Retrieve user object
  const token = user?.token;
  console.log("User:", user.id);

  if (!user || !token) {
    alert("You must be logged in to add a transaction.");
    return;
  }

  const description = document.getElementById("description").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value || new Date().toLocaleDateString('sv-SE'); // Use current date if not provided

  console.log(date);

  if (!description || isNaN(amount) || !category) {
    alert("Please fill in all fields.");
    return;
  }



  try {
    const response = await fetch(`/addTransactionToAccount`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${user.token}`
      },
      body: JSON.stringify({
        description,
        amount,
        category,
        date: date
      })
    });

    const result = await response.json();

        if (!response.ok) {
      autoLogout(response);
    }

    if (response.ok) {
      alert("Transaction added successfully.");
      document.getElementById("transaction-form").reset();
      document.querySelector(".form-container-transaction").hidden = true;

      // Optional: refresh transaction list

    const selectedMonth = date.slice(0, 7); // Extract 'YYYY-MM' from date
    const dropdown = document.getElementById("month-select");
    dropdown.value = selectedMonth; // Update dropdown to match the transaction month
    updateTransactionRecords(user, selectedMonth);
    displayBudgetExpenditurePieChart(user, selectedMonth);
      displayBarCharts(user, selectedMonth);
    } else {
      alert(result.message || "Failed to add transaction.");
    }

  } catch (error) {
    console.error("Error adding transaction:", error);
    alert("An error occurred while adding the transaction.");
  }
});


//change goal
document.addEventListener("click", async function(event) {
  if (event.target.id === "save-budget") {
    event.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("You must be logged in to save a budget.");
      return;
    }

    const food = document.getElementById("food-budget").value || 0;
    const transport = document.getElementById("transport-budget").value || 0;
    const utilities = document.getElementById("utilities-budget").value || 0;
    const others = document.getElementById("other-budget").value || 0;

    const monthlyGoal = {
      food: parseFloat(food),
      transport: parseFloat(transport),
      utilities: parseFloat(utilities),
      others: parseFloat(others)
    };

    try {
      const response = await fetch("/addExpenditureGoal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(monthlyGoal)
      });

      if (!response.ok) {
        autoLogout(response);
        return;
      }

      const data = await response.json();

      if (data.message) {
        alert(data.message);
        document.getElementById("budget-form").reset();
        document.getElementById("form-container-budget").hidden = true;

        // Refresh budget pie chart
        const now = new Date();
        const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        displayBudgetExpenditurePieChart(user, yearMonth);
        displayBarCharts(user, yearMonth);
        updateTransactionRecords(user, yearMonth);
      } else {
        alert("Failed to save budget.");
      }
    } catch (error) {
      console.error("Error saving budget:", error);
      alert("An error occurred while saving the budget.");
    }
  }
});


document.addEventListener("click", async function(event) {
  if (event.target.classList.contains("transaction-record")) {
    event.preventDefault();
    const recordId = event.target.getAttribute('data-id');
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Record ID clicked:", recordId);
    const popup = document.getElementById("transaction-popup");
    const transactionData = await fetch(`/getTransactionByID/${recordId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${user.token}`
      }})

    .then(response => {
      if (!response.ok) {
        autoLogout(response);
      }
      return response.json();
    })
    .then(data => {
      if (data.message) {
        alert(data.message);
        return;
      }

      // Populate popup with transaction details
      const transactionDetails = document.getElementById("transaction-details");
      document.getElementById("transaction-date").textContent = formatDate(data.date);
      document.getElementById("transaction-category").textContent = data.cat;
      document.getElementById("transaction-description").textContent = data.description;
      document.getElementById("transaction-amount").textContent = `${parseFloat(data.amount).toFixed(2)}`;
      transactionDetails.setAttribute('data-id', recordId); // Store entry ID for future reference
      displayPopup(transactionDetails);
    })

}});


function displayPopup(popup) {
  popup.style.display = "block";
}

function hidePopup(popup) {
  popup.style.display = "none";
}

document.getElementById("close-button").addEventListener("click", function() {
  const popup = document.getElementById("transaction-details");
  hidePopup(popup); // Call the hidePopup function with the popup element
});


const editBtn = document.getElementById('edit-icon');
const closeBtn = document.getElementById('close-button');
let isEditing = false;

  const fields = [
    { span: 'transaction-date', input: 'transaction-date-input' },
    { span: 'transaction-description', input: 'transaction-description-input' },
    { span: 'transaction-category', input: 'transaction-category-input' },
    { span: 'transaction-amount', input: 'transaction-amount-input' },
  ];

  editBtn.addEventListener('click', () => {
  isEditing = !isEditing;

  fields.forEach(({ span, input }) => {
    const spanEl = document.getElementById(span);
    const inputEl = document.getElementById(input);

    if (isEditing) {
      let value = spanEl.textContent.trim();

      // Special handling for the date field
      if (inputEl.type === 'date') {
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate)) {
          // Format to YYYY-MM-DD
          const year = parsedDate.getFullYear();
          const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const day = String(parsedDate.getDate()).padStart(2, '0');
          inputEl.value = `${year}-${month}-${day}`;
        }
      } else {
        inputEl.value = value;
      }

      spanEl.classList.add('hidden');
      inputEl.classList.remove('hidden');
    } else {
      spanEl.textContent = inputEl.value;
      inputEl.classList.add('hidden');
      spanEl.classList.remove('hidden');
    }
  });

  closeBtn.textContent = isEditing ? 'Update Record' : 'Close';
  editBtn.innerHTML = isEditing ? '&#10006;' : '&#9998;';
});



  closeBtn.addEventListener('click', async () => {
    if (isEditing) {
      
      const transactionDetails = document.getElementById("transaction-details");
      const recordId = transactionDetails.getAttribute('data-id');
      const user = JSON.parse(localStorage.getItem("user"));

      const updatedData = {
        date: document.getElementById('transaction-date-input').value || new Date().toLocaleDateString('sv-SE'),
        description: document.getElementById('transaction-description-input').value,
        cat: document.getElementById('transaction-category-input').value,
        amount: parseFloat(document.getElementById('transaction-amount-input').value)
      };

      console.log("Updating record with ID:", recordId);
      await fetch(`/updateTransaction/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(updatedData)
          })
            .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log(data.message || "Transaction updated successfully.");
      })
      .catch(err => {
        console.error('Fetch error:', err);
      });



      yearMonth = updatedData.date.slice(0, 7); // Extract 'YYYY-MM' from date
      const dropdown = document.getElementById("month-select");
      dropdown.value = yearMonth; // Update dropdown to match the transaction month
      updateTransactionRecords(user, yearMonth);
      displayBudgetExpenditurePieChart(user, yearMonth);
      editBtn.click(); // Toggle back to view mode

    } else {
      document.getElementById('transaction-details').classList.remove('show');
    }
});

const deleteBtn = document.getElementById('delete-button');

// Show/hide delete button when toggling edit mode
editBtn.addEventListener('click', () => {
  deleteBtn.classList.toggle('hidden', !isEditing);
});

// Handle delete action
deleteBtn.addEventListener('click', async () => {
  const transactionDetails = document.getElementById("transaction-details");
  const recordId = transactionDetails.getAttribute('data-id');
  const user = JSON.parse(localStorage.getItem("user"));

  if (!recordId) return alert("No record selected.");
  const confirmed = confirm("Are you sure you want to delete this transaction?");
  if (!confirmed) return;

  try {
    const res = await fetch(`/deleteTransaction/${recordId}`, {
      method: 'DELETE',
      headers: {
        'authorization': `Bearer ${user.token}`
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const result = await res.json();
    console.log(result.message || "Transaction deleted.");
    alert("Transaction deleted.");

    document.getElementById('transaction-details').classList.remove('show');
      const popup = document.getElementById("transaction-details");
    hidePopup(popup); // Hide the popup after deletion

    const dropdown = document.getElementById("month-select");
    const selectedMonth = dropdown.value;

    updateTransactionRecords(user, selectedMonth);
    displayBudgetExpenditurePieChart(user, selectedMonth);
  } catch (err) {
    console.error("Delete error:", err);
    alert("Failed to delete transaction.");
  }
});


function autoLogout(response) {
    if (response.status === 403) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("user");
        window.location.href = "login.html";
        return;
    }
}

async function populateMonthDropdown() {
  const select = document.getElementById("month-select");

  // Add a "Show All" option
  const allOption = document.createElement("option");

  const now = new Date();

          const date = new Date(now.getFullYear(), now.getMonth(), 1);
        const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed

    const yearMonth = `${year}-${month}`; // 'YYYY-MM'
  allOption.value = yearMonth;
  allOption.textContent = "-- Current Month --";
  select.appendChild(allOption);

  for (let i = 1; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    // Use getFullYear() and getMonth() to avoid timezone mismatch
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed

    const yearMonth = `${year}-${month}`; // 'YYYY-MM'
    const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    console.log(yearMonth, label);

    const option = document.createElement('option');
    option.value = yearMonth;
    option.textContent = label;
    select.appendChild(option);
  }
}


document.getElementById("month-select").addEventListener("change", async function () {
  const user = JSON.parse(localStorage.getItem("user"));
  const selectedMonth = this.value;

  if (!user) return;

  if (selectedMonth === "all") {
    await updateTransactionRecords(user); // no filter
    await displayBudgetExpenditurePieChart(user); // fallback to current month
    await updateBarChart(user); // no filter
  } else {
    await displayBudgetExpenditurePieChart(user, selectedMonth);
    await displayBarCharts(user, selectedMonth);
    await updateTransactionRecords(user, selectedMonth);
  }
});

async function updateBarChart(user, selectedMonth = null) {
  const month = selectedMonth || new Date().toLocaleDateString('sv-SE');

  try {
    const response = await fetch(`/getBudgetChartByMonth/${month}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${user.token}`
      }
    });

    const data = await response.json();

    // Use the same chart as doughnut, but extract total for bar if needed
    console.log("Bar chart simulation data:", data);

    // Optional: swap or display a different chart image for bar chart
    // For now, keep it combined with pie chart or add a second <img> if needed

  } catch (err) {
    console.error("Error updating bar chart:", err);
  }
}

