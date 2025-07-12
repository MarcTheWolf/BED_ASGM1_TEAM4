function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  if (modal.style.display === "flex") {
    modal.style.display = "none";
  } else {
    modal.style.display = "flex";
  }
}

const addTaskBtn = document.querySelector('.add-task');
if (addTaskBtn) {
  addTaskBtn.addEventListener('click', () => {
    toggleModal('addModal');
  });
}

const createTaskBtn = document.querySelector('#createTaskBtn');
if (createTaskBtn) {
  createTaskBtn.addEventListener('click', (event) => {
    event.preventDefault();

    const modal = document.getElementById('addModal');
    if (!modal) return;

    const inputs = modal.querySelectorAll('input, select, textarea');
    let isValid = true;

    for (const input of inputs) {
      if (input.disabled || input.type === 'hidden') continue;
      if (!input.value.trim()) {
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      alert("Please fill in all fields before creating the task.");
    } else {
      alert("Task created successfully!");
      toggleModal('addModal');
      // TODO: Add logic to actually create and display the task
    }
  });
}

const deleteTaskBtn = document.querySelector('.delete-task');
if (deleteTaskBtn) {
  deleteTaskBtn.addEventListener('click', () => {
    // For demo, open edit modal with dummy data
    openEditModal('Sample Task', '2025-07-17', '12:00 – 13:00', 'Sample description');
  });
}

// Function to open Edit Modal with pre-filled data
function openEditModal(taskName, taskDate, taskTime, taskDesc) {
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
  // 3 - Description (textarea, disabled in your code, so we enable it here for editing)
  
  if (inputs.length >= 4) {
    inputs[0].value = taskName;
    inputs[0].disabled = false;  // allow editing task name
    
    inputs[1].value = taskDate;
    inputs[1].disabled = true;   // keep date disabled
    
    inputs[2].value = taskTime;
    inputs[2].disabled = true;   // keep time disabled
    
    inputs[3].value = taskDesc;
    inputs[3].disabled = false;  // allow editing description
  }
}

// Attach listeners for Delete and Save buttons inside Edit Modal
document.addEventListener('DOMContentLoaded', () => {
  const deleteBtn = document.querySelector('#editModal .btn-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      // Here you would remove the task from your data/store
      alert('Delete clicked! Implement task deletion here.');
      toggleModal('editModal');
    });
  }

  const saveBtn = document.querySelector('#editModal .btn-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      // Get updated values from inputs
      const editModal = document.getElementById('editModal');
      if (!editModal) return;

      const inputs = editModal.querySelectorAll('input, textarea');
      const updatedTaskName = inputs[0].value.trim();
      const updatedTaskDesc = inputs[3].value.trim();

      if (!updatedTaskName) {
        alert("Task name cannot be empty.");
        return;
      }

      // TODO: Save the updated task details to your data/store
      alert(`Save clicked! Updated task name: "${updatedTaskName}" and description: "${updatedTaskDesc}"`);

      toggleModal('editModal');
    });
  }

  const editableTaskCard = document.querySelector('.tasks-tomorrow .task-card.medication:last-child');
  if (editableTaskCard) {
    editableTaskCard.addEventListener('click', () => {
      const taskName = editableTaskCard.querySelector('strong')?.textContent || "Task Title";
      const taskDesc = editableTaskCard.querySelector('span')?.textContent || "";
      openEditModal(taskName, '2025-07-17', '12:00 – 13:00', taskDesc);
    });
  }
});
