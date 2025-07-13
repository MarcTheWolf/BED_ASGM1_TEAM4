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
});

cancelBudgetBtn.addEventListener("click", function() {
    budgetformContainer.hidden = true;
    budgetForm.reset();
});

saveBudgetBtn.addEventListener("click", function(event) {}) //Add API endpoint


document.addEventListener("DOMContentLoaded", async function() {
    const user = JSON.parse(localStorage.getItem("user")); // Now it's an object
    if (user) {
        await updateTransactionRecords(user);
        await displayBudgetExpenditurePieChart(user);
    }
});

async function updateTransactionRecords(user) {
  const container = document.querySelector('.transaction-records-list');
  container.innerHTML = ''; // Clear existing records
  console.log("Updating transaction records for user:", user);

  try {
    console.log(user.token)
    const response = await fetch(`/getAllTransactionsByID/${user.id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${user.token}`
        }
    });
    const data = await response.json();
    console.log("Fetched transaction data:", data);

    if (!Array.isArray(data)) {
      throw new Error("Invalid data format from server");
    }

    // Sort transactions by date (descending)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Group transactions by month-year
    const grouped = {};
    data.forEach(record => {
      const date = new Date(record.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

      if (!grouped[monthYear]) grouped[monthYear] = [];
      grouped[monthYear].push(record);
    });

    // Append to DOM
    for (const [monthYear, records] of Object.entries(grouped)) {
      const header = document.createElement('div');
      header.className = 'transaction-month-header';
      header.textContent = monthYear;
      container.appendChild(header);

      records.forEach(record => {
        const recordDiv = document.createElement('div');
        recordDiv.className = 'transaction-record';
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

async function displayBudgetExpenditurePieChart(user) {
    const now = new Date();
    const month = now.toISOString().slice(0, 7); // "YYYY-MM"
    const container = document.querySelector('.finance-pie-chart');
    container.innerHTML = ''; // Clear existing chart
    
    try {
        const response = await fetch(`/getBudgetExpenditureDoughnutChart/${month}/${user.id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${user.token}`
        }
        });
    
        const data = await response.json();
        container.src = data.chartUrl;
        console.log("Budget expenditure pie chart displayed successfully.");
        console.log("Chart source:", container.src);
    
    } catch (error) {
        console.error("Error displaying budget expenditure pie chart:", error);
    }
}

function formatDate(dateString) {
    const options = {month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  if (!description || isNaN(amount) || !category) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch(`/addTransactionToAccount/${user.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${user.token}`
      },
      body: JSON.stringify({
        description,
        amount,
        category,
        date: new Date().toISOString().split("T")[0] // current date in YYYY-MM-DD format
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert("Transaction added successfully.");
      document.getElementById("transaction-form").reset();
      document.querySelector(".form-container-transaction").hidden = true;

      // Optional: refresh transaction list
      await updateTransactionRecords(user);
      await displayBudgetExpenditurePieChart(user);
    } else {
      alert(result.message || "Failed to add transaction.");
    }

  } catch (error) {
    console.error("Error adding transaction:", error);
    alert("An error occurred while adding the transaction.");
  }
});