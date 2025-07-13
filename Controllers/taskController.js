const taskModel = require("../Models/taskModel.js");

// Add task
async function addTask(req, res) {
    const accountId = req.user.id; // Get user ID from JWT token
    const taskData = req.body;

    // Validate required fields
    if (!taskData.title || !taskData.date) {
        return res.status(400).json({ 
            message: "Task title and date are required" 
        });
    }

    try {
        const taskId = await taskModel.addTask(accountId, taskData);
        res.status(201).json({ 
            message: "Task created successfully", 
            taskId: taskId 
        });
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Delete task
async function deleteTask(req, res) {
    const taskId = req.params.task_id;
    const accountId = req.user.id;

    try {
        const result = await taskModel.deleteTask(taskId, accountId);
        if (result) {
            res.status(200).json({ message: "Task deleted successfully" });
        } else {
            res.status(404).json({ message: "Task not found or no permission to delete" });
        }
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Update task
async function updateTask(req, res) {
    const taskId = req.params.task_id;
    const accountId = req.user.id;
    const taskData = req.body;

    // Validate required fields
    if (!taskData.title || !taskData.date) {
        return res.status(400).json({ 
            message: "Task title and date are required" 
        });
    }

    try {
        const result = await taskModel.updateTask(taskId, accountId, taskData);
        if (result) {
            res.status(200).json({ message: "Task updated successfully" });
        } else {
            res.status(404).json({ message: "Task not found or no permission to update" });
        }
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Get all tasks for user
async function getAllTasks(req, res) {
    const accountId = req.user.id;

    try {
        const tasks = await taskModel.getAllTasks(accountId);
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Get task by ID
async function getTaskById(req, res) {
    const taskId = req.params.task_id;
    const accountId = req.user.id;

    try {
        const task = await taskModel.getTaskById(taskId, accountId);
        if (task) {
            res.status(200).json(task);
        } else {
            res.status(404).json({ message: "Task not found" });
        }
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Get tasks by month
async function getTasksByMonth(req, res) {
    const { month, year } = req.query;
    const accountId = req.user.id;

    if (!month || !year) {
        return res.status(400).json({ 
            message: "Month and year parameters are required" 
        });
    }

    try {
        const tasks = await taskModel.getTasksByMonth(accountId, month, year);
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Get tasks by date
async function getTasksByDate(req, res) {
    const { date } = req.params;
    const accountId = req.user.id;

    try {
        const tasks = await taskModel.getTasksByDate(accountId, date);
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Update task status
async function updateTaskStatus(req, res) {
    const taskId = req.params.task_id;
    const accountId = req.user.id;
    const { status } = req.body;

    if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ 
            message: "Status must be pending, completed, or cancelled" 
        });
    }

    try {
        const result = await taskModel.updateTaskStatus(taskId, accountId, status);
        if (result) {
            res.status(200).json({ message: "Task status updated successfully" });
        } else {
            res.status(404).json({ message: "Task not found or no permission to update" });
        }
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Initialize task table
async function initializeTaskTable(req, res) {
    try {
        await taskModel.createTaskTable();
        res.status(200).json({ message: "Task table initialized successfully" });
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    addTask,
    deleteTask,
    updateTask,
    getAllTasks,
    getTaskById,
    getTasksByMonth,
    getTasksByDate,
    updateTaskStatus,
    initializeTaskTable
}; 