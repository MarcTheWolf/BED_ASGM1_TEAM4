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

openBudgetBtn.addEventListener("click", function() {
    budgetformContainer.hidden = false;
});

cancelBudgetBtn.addEventListener("click", function() {
    budgetformContainer.hidden = true;
    budgetForm.reset();
});

saveBudgetBtn.addEventListener("click", function(event) {}) //Add API endpoint

