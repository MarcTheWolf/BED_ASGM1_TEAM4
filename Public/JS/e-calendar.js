function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  if (modal.style.display === "flex") {
    modal.style.display = "none";
  } else {
    modal.style.display = "flex";
  }
}

const user = JSON.parse(localStorage.getItem("user"));

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

function toggleEditTaskForm(){
  const editTaskForm = document.getElementById('form-container-edit-task')
  editTaskForm.hidden = !editTaskForm.hidden;
}

const cancelEditBtnTask = document.getElementById('cancel-edit-btn-task');
if (cancelEditBtnTask) {
  cancelEditBtnTask.addEventListener('click', function() {
    const editTaskForm = document.getElementById('form-container-edit-task');
    if (editTaskForm) editTaskForm.hidden = true;
  });
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
  const res = await fetch('/tasks', {
    method: 'GET',
    headers: {'Authorization': `Bearer ${user.token}`}}
  );
  if (!res.ok) return;
  const tasks = await res.json();
  renderTasks('.tasks-today', tasks); // Render all tasks in one area
  
  // Clear existing task indicators on calendar
  clearCalendarTasks();
  
  // Display all tasks on calendar
  tasks.forEach(task => {
    addTaskToCalendar(task.task_name, task.date);
  });
}

// New function: Clear task indicators from calendar
function clearCalendarTasks() {
  const taskIndicators = document.querySelectorAll('.task-indicator');
  taskIndicators.forEach(indicator => indicator.remove());
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function renderTasks(selector, tasks) {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = '<h4></h4>';
  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card';
    const taskDate = new Date(task.date);
    const formattedDate = taskDate.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});

    const dateForEdit = taskDate.toISOString().split('T')[0];
    
    let timeDisplay = '';
    if (task.time && task.time.trim() !== '') {
      const timeParts = task.time.split(':');
      if (timeParts.length >= 2) {
        timeDisplay = `${timeParts[0]}:${timeParts[1]}`;
      } else {
        timeDisplay = task.time;
      }
    }
    
    card.innerHTML = `
      <strong>${task.task_name}</strong>
      <span>${formattedDate} ${timeDisplay ? `at ${timeDisplay}` : ''}</span>
      <button class="edit-task" data-id="${task.task_id}" data-name="${task.task_name}" data-date="${dateForEdit}" data-time="${task.time || ''}">Edit ✏️</button>
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
      headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}`},
      body: JSON.stringify(data)
    });
    if (res.ok) {
      loadTasks();
      addTaskToCalendar(data.task_name, data.date); // Add task to calendar display
      // Force close form
      const taskForm = document.getElementById('form-container-task');
      if (taskForm) {
        taskForm.hidden = true;
      }
    } else {
      alert('Failed to add task');
    }
  });
}

// Edit task form submit
const editTaskForm = document.getElementById('edit-task-form');
if (editTaskForm) {
  editTaskForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const taskId = document.getElementById('edit-task-id').value;
    const data = {
      task_name: document.getElementById('edit-task-name').value,
      date: document.getElementById('edit-task-date').value,
      time: document.getElementById('edit-task-time').value
    };
    const res = await fetch(`/tasks/${taskId}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}`},
      body: JSON.stringify(data)
    });
    if (res.ok) {
      loadTasks();
      const editTaskForm = document.getElementById('form-container-edit-task');
      if (editTaskForm) {
        editTaskForm.hidden = true;
      }
    } else {
      alert('Failed to update task');
    }
  });
}

// New function: Add task indicator to calendar
function addTaskToCalendar(taskName, taskDate) {
  // Convert date string to Date object
  const date = new Date(taskDate);
  const day = date.getDate();
  
  // Find corresponding date box
  const dayBoxes = document.querySelectorAll('.day-box');
  let targetDayBox = null;
  
  // Find day-box containing corresponding date number
  for (let dayBox of dayBoxes) {
    const dateNumber = dayBox.querySelector('.date-number');
    if (dateNumber && parseInt(dateNumber.textContent) === day) {
      targetDayBox = dayBox;
      break;
    }
  }
  
  if (targetDayBox) {
    // Create task indicator
    const taskIndicator = document.createElement('div');
    taskIndicator.className = 'task-indicator';
    taskIndicator.innerHTML = `
      <div class="task-line"></div>
      <span class="task-name">${taskName}</span>
    `;
    
    // Add to date box
    targetDayBox.appendChild(taskIndicator);
  }
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
      const res = await fetch(`/tasks/${taskId}`, { method: 'DELETE', headers: {'Authorization': `Bearer ${user.token}`} });
      if (res.ok) {
        loadTasks();
      } else {
        alert('Failed to delete task');
      }
    }
  }
  
  if (e.target.classList.contains('edit-task')) {
    const taskId = e.target.dataset.id;
    const taskName = e.target.dataset.name;
    const taskDate = e.target.dataset.date;
    const taskTime = e.target.dataset.time;
    
    // Fill edit form
    document.getElementById('edit-task-id').value = taskId;
    document.getElementById('edit-task-name').value = taskName;
    document.getElementById('edit-task-date').value = taskDate;
    
    // 确保时间格式正确用于编辑表单
    let timeForEdit = '';
    if (taskTime && taskTime.trim() !== '') {
      const timeParts = taskTime.split(':');
      if (timeParts.length >= 2) {
        timeForEdit = `${timeParts[0]}:${timeParts[1]}`; // 只保留 HH:MM 格式
      } else {
        timeForEdit = taskTime;
      }
    }
    document.getElementById('edit-task-time').value = timeForEdit;
    
    // Show edit form
    toggleEditTaskForm();
  }
});

// Automatically load tasks on page load
window.addEventListener('DOMContentLoaded', loadTasks);