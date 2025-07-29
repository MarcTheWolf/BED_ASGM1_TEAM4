const taskModel = require("../Models/taskModel.js");

// Get all tasks
async function getTasks(req, res) {
    try {
        const tasks = await taskModel.getTasks();
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Add task
async function addTask(req, res) {
    const taskData = req.body;
    if (!taskData.task_name || !taskData.date) {
        return res.status(400).json({ message: "Task name and date are required" });
    }
    try {
        const taskId = await taskModel.addTask(taskData);
        res.status(201).json({ message: "Task created successfully", taskId });
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Delete task
async function deleteTask(req, res) {
    const { task_id } = req.params;
    try {
        const result = await taskModel.deleteTask(task_id);
        if (result) {
            res.status(200).json({ message: "Task deleted successfully" });
        } else {
            res.status(404).json({ message: "Task not found" });
        }
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Update task
async function updateTask(req, res) {
    const { task_id } = req.params;
    const taskData = req.body;
    if (!taskData.task_name || !taskData.date) {
        return res.status(400).json({ message: "Task name and date are required" });
    }
    try {
        const result = await taskModel.updateTask(task_id, taskData);
        if (result) {
            res.status(200).json({ message: "Task updated successfully" });
        } else {
            res.status(404).json({ message: "Task not found" });
        }
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


module.exports = {
    getTasks,
    addTask,
    deleteTask,
    updateTask,
}; 