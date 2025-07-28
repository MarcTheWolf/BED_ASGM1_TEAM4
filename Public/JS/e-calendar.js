function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  if (modal.style.display === "flex") {
    modal.style.display = "none";
  } else {
    modal.style.display = "flex";
  }
}

//add
const addTaskBtn = document.getElementById('add-task-button');

addTaskBtn.addEventListener('click', toggleTaskForm)

// Remove old .close-btn bindings
// Add close-add-btn for Add form
const closeAddBtns = document.querySelectorAll('.close-add-btn');
closeAddBtns.forEach(function(btn) {
  btn.addEventListener('click', toggleTaskForm);
});

function toggleTaskForm(){
  const taskForm = document.getElementById('form-container-task')
  taskForm.hidden = !taskForm.hidden;
  if (!taskForm.hidden) {
    // Reset form fields when opening
    document.getElementById('task-name').value = '';
    document.getElementById('task-date').value = '';
    document.getElementById('task-time').value = '';
  }
}

const cancelBtnTask = document.getElementById('cancel-btn-task');
if (cancelBtnTask) {
  cancelBtnTask.addEventListener('click', function() {
    const taskForm = document.getElementById('form-container-task');
    if (taskForm) taskForm.hidden = true;
  });
}



function toggleTaskFormT(){
  const taskForm = document.getElementById('form-container-task2')
    taskForm.hidden = !taskForm.hidden;
}

const cancelBtnTask2 = document.getElementById('cancel-btn-task2');
if (cancelBtnTask2) {
  cancelBtnTask2.addEventListener('click', function() {
    const taskForm = document.getElementById('form-container-task2');
    if (taskForm) taskForm.hidden = true;
  });
}

// Function to open Edit Modal with pre-filled data
function openEditModal(taskName, taskDate, taskTime) {
  toggleModal('editModal');

  const editModal = document.getElementById('editModal');
  if (!editModal) return;

  // Get modal inputs
  const inputs = editModal.querySelectorAll('input, textarea');

  // Assign values accordingly
  // Assuming order:
  // 0 - Task Name (editable)
  // 1 - Date (disabled)
  // 2 - Time (disabled)
  
  if (inputs.length >= 4) {
    inputs[0].value = taskName;
    inputs[0].disabled = false;  // allow editing task name
    
    inputs[1].value = taskDate;
    inputs[1].disabled = true;   // keep date disabled
    
    inputs[2].value = taskTime;
    inputs[2].disabled = true;   // keep time disabled
    
  }
}

// Attach listeners for Delete and Save buttons inside Edit Modal

// ========== Task Related Functions ========== //

// Load task list and render to page
async function loadTasks() {
  const res = await fetch('/tasks');
  if (!res.ok) return;
  const tasks = await res.json();
  renderTasks('.tasks-today', tasks); // Render all tasks in one area
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function renderTasks(selector, tasks) {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = '<h4>All Tasks</h4>'; // Change title to "All Tasks"
  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card';
    const taskDate = new Date(task.date);
    const formattedDate = taskDate.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
    const formattedTime = taskDate.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});
    card.innerHTML = `
      <strong>${task.task_name}</strong>
      <span>${formattedDate} ${formattedTime || ''}</span>
      <button class="delete-task" data-id="${task.task_id}">Delete ❌</button>
    `;
    container.appendChild(card);
  });
}

// Add task form submit
const addTaskForm = document.getElementById('add-task-form');
if (addTaskForm) {
  addTaskForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = {
      task_name: document.getElementById('task-name').value,
      date: document.getElementById('task-date').value,
      time: document.getElementById('task-time').value
    };
    const res = await fetch('/tasks', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    if (res.ok) {
      loadTasks();
      //toggleTaskForm(); // Close form after adding
    } else {
      alert('Failed to add task');
    }
  });
}

// Delete task button
// Use event delegation, listen on the whole document
// Trigger when .btn-delete is clicked
// This works for dynamically rendered buttons
//
document.addEventListener('click', async function(e) {
  if (e.target.classList.contains('delete-task')) {
    const taskId = e.target.dataset.id;
    if (confirm('Are you sure you want to delete this task?')) {
      const res = await fetch(`/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        loadTasks();
      } else {
        alert('Failed to delete task');
      }
    }
  }
});

// Automatically load tasks on page load
window.addEventListener('DOMContentLoaded', loadTasks);