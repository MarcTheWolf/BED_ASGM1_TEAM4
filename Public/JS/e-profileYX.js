//1////////////////////////////////////////
const addTaskBtn = document.getElementById('add-task-button');

addTaskBtn.addEventListener('click', toggleTaskForm)

var closeTaskForm = document.querySelectorAll('.close-btn')

closeTaskForm.forEach(function(btn) {
  btn.addEventListener('click', toggleTaskForm);
});

function toggleTaskForm(){
  const taskForm = document.getElementById('form-container-task')
    taskForm.hidden = !taskForm.hidden;
}

//2////////////////////////////////////////
const addMdBtn = document.getElementById('add-md-button');

addMdBtn.addEventListener('click', toggleMdForm)

var closeMdForm = document.querySelectorAll('.close-mdbtn')

closeMdForm.forEach(function(btn) {
  btn.addEventListener('click', toggleMdForm);
});

function toggleMdForm(){
  const mdForm = document.getElementById('form-container-md')
    mdForm.hidden = !mdForm.hidden;
}

//3////////////////////////////////////////
const editBtn = document.getElementById('edit-button');

editBtn.addEventListener('click', toggleeditForm)

var closeeditForm = document.querySelectorAll('.close-editbtn')

closeeditForm.forEach(function(btn) {
  btn.addEventListener('click', toggleeditForm);
});

function toggleeditForm(){
  const editForm = document.getElementById('form-container-edit')
    editForm.hidden = !editForm.hidden;
}