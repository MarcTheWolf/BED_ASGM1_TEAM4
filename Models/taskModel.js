const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all tasks
async function getTasks() {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        
        const result = await request.query(`
            SELECT task_id, task_name, date, time FROM TaskList ORDER BY date, time;
        `);

        return result.recordset;
    } catch (error) {
        console.error("Model error:", error);
        throw error;
    } finally {
        if (connection) {
            connection.close();
        }
    }
}

// Add task
async function addTask(taskData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("task_name", sql.VarChar(50), taskData.task_name);
        request.input("date", sql.Date, taskData.date);
        
        // Handle time format properly - store as VARCHAR to avoid TIME type issues
        let timeValue = null;
        if (taskData.time && taskData.time.trim() !== '') {
            const timeStr = taskData.time.trim();
            console.log('Processing time:', timeStr); // Debug log
            
            if (timeStr.match(/^\d{1,2}:\d{2}$/)) {
                // If format is HH:MM, add seconds
                timeValue = timeStr + ':00';
            } else if (timeStr.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
                // If format is HH:MM:SS, use as is
                timeValue = timeStr;
            } else {
                throw new Error('Invalid time format. Use HH:MM or HH:MM:SS');
            }
            console.log('Converted time:', timeValue); // Debug log
        }
        
        // Use VARCHAR for time to avoid SQL Server TIME type validation issues
        request.input("time", sql.VarChar(10), timeValue);

        const result = await request.query(`
            INSERT INTO TaskList (task_name, date, time)
            OUTPUT INSERTED.task_id
            VALUES (@task_name, @date, @time);
        `);

        return result.recordset[0].task_id;
    } catch (error) {
        console.error("Model error:", error);
        throw error;
    } finally {
        if (connection) {
            connection.close();
        }
    }
}

// Delete task
async function deleteTask(task_id) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("task_id", sql.Int, task_id);

        const result = await request.query(`
            DELETE FROM TaskList WHERE task_id = @task_id;
        `);

        return result.rowsAffected > 0;
    } catch (error) {
        console.error("Model error:", error);
        throw error;
    } finally {
        if (connection) {
            connection.close();
        }
    }
}

// Update task
async function updateTask(task_id, taskData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("task_id", sql.Int, task_id);
        request.input("task_name", sql.VarChar(50), taskData.task_name);
        request.input("date", sql.Date, taskData.date);
        
        // Handle time format properly - store as VARCHAR to avoid TIME type issues
        let timeValue = null;
        if (taskData.time && taskData.time.trim() !== '') {
            const timeStr = taskData.time.trim();
            console.log('Processing time:', timeStr); // Debug log
            
            if (timeStr.match(/^\d{1,2}:\d{2}$/)) {
                // If format is HH:MM, add seconds
                timeValue = timeStr + ':00';
            } else if (timeStr.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
                // If format is HH:MM:SS, use as is
                timeValue = timeStr;
            } else {
                throw new Error('Invalid time format. Use HH:MM or HH:MM:SS');
            }
            console.log('Converted time:', timeValue); // Debug log
        }
        
        // Use VARCHAR for time to avoid SQL Server TIME type validation issues
        request.input("time", sql.VarChar(10), timeValue);

        const result = await request.query(`
            UPDATE TaskList 
            SET task_name = @task_name, date = @date, time = @time
            WHERE task_id = @task_id;
        `);

        return result.rowsAffected > 0;
    } catch (error) {
        console.error("Model error:", error);
        throw error;
    } finally {
        if (connection) {
            connection.close();
        }
    }
}

module.exports = {
    getTasks,
    addTask,
    deleteTask,
    updateTask,
}; 