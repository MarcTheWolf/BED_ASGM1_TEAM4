const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Create task table if it doesn't exist
async function createTaskTable() {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        await connection.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TaskList' AND xtype='U')
            CREATE TABLE TaskList (
                id INT PRIMARY KEY IDENTITY(1,1),
                account_id INT NOT NULL,
                title VARCHAR(100) NOT NULL,
                description VARCHAR(500) NULL,
                date DATE NOT NULL,
                time TIME NULL,
                priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
                status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE()
            )
        `);
    } catch (error) {
        console.error("Error creating task table:", error);
        throw error;
    } finally {
        if (connection) {
            connection.close();
        }
    }
}

// Add task
async function addTask(accountId, taskData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("accountId", sql.Int, accountId);
        request.input("title", sql.VarChar(100), taskData.title);
        request.input("description", sql.VarChar(500), taskData.description || null);
        request.input("date", sql.Date, taskData.date);
        request.input("time", sql.Time, taskData.time || null);
        request.input("priority", sql.VarChar(20), taskData.priority || 'medium');

        const result = await request.query(`
            INSERT INTO TaskList (account_id, title, description, date, time, priority)
            VALUES (@accountId, @title, @description, @date, @time, @priority);
            SELECT SCOPE_IDENTITY() as id;
        `);

        return result.recordset[0].id;
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
async function deleteTask(taskId, accountId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("taskId", sql.Int, taskId);
        request.input("accountId", sql.Int, accountId);

        const result = await request.query(`
            DELETE FROM TaskList
            WHERE id = @taskId AND account_id = @accountId;
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
async function updateTask(taskId, accountId, taskData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("taskId", sql.Int, taskId);
        request.input("accountId", sql.Int, accountId);
        request.input("title", sql.VarChar(100), taskData.title);
        request.input("description", sql.VarChar(500), taskData.description || null);
        request.input("date", sql.Date, taskData.date);
        request.input("time", sql.Time, taskData.time || null);
        request.input("priority", sql.VarChar(20), taskData.priority || 'medium');
        request.input("status", sql.VarChar(20), taskData.status || 'pending');

        const result = await request.query(`
            UPDATE TaskList
            SET title = @title, 
                description = @description, 
                date = @date, 
                time = @time, 
                priority = @priority, 
                status = @status,
                updated_at = GETDATE()
            WHERE id = @taskId AND account_id = @accountId;
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

// Get all tasks for a user
async function getAllTasks(accountId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input("accountId", sql.Int, accountId)
            .query(`
                SELECT 
                    id,
                    title,
                    description,
                    date,
                    time,
                    priority,
                    status,
                    created_at,
                    updated_at
                FROM TaskList
                WHERE account_id = @accountId
                ORDER BY date, time, priority DESC
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

// Get task by ID
async function getTaskById(taskId, accountId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input("taskId", sql.Int, taskId)
            .input("accountId", sql.Int, accountId)
            .query(`
                SELECT 
                    id,
                    title,
                    description,
                    date,
                    time,
                    priority,
                    status,
                    created_at,
                    updated_at
                FROM TaskList
                WHERE id = @taskId AND account_id = @accountId
            `);

        return result.recordset[0];
    } catch (error) {
        console.error("Model error:", error);
        throw error;
    } finally {
        if (connection) {
            connection.close();
        }
    }
}

// Get tasks by month
async function getTasksByMonth(accountId, month, year) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input("accountId", sql.Int, accountId)
            .input("month", sql.Int, month)
            .input("year", sql.Int, year)
            .query(`
                SELECT 
                    id,
                    title,
                    description,
                    date,
                    time,
                    priority,
                    status,
                    created_at,
                    updated_at
                FROM TaskList
                WHERE account_id = @accountId 
                AND MONTH(date) = @month 
                AND YEAR(date) = @year
                ORDER BY date, time, priority DESC
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

// Get tasks by date
async function getTasksByDate(accountId, date) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input("accountId", sql.Int, accountId)
            .input("date", sql.Date, date)
            .query(`
                SELECT 
                    id,
                    title,
                    description,
                    date,
                    time,
                    priority,
                    status,
                    created_at,
                    updated_at
                FROM TaskList
                WHERE account_id = @accountId AND date = @date
                ORDER BY time, priority DESC
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

// Update task status
async function updateTaskStatus(taskId, accountId, status) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("taskId", sql.Int, taskId);
        request.input("accountId", sql.Int, accountId);
        request.input("status", sql.VarChar(20), status);

        const result = await request.query(`
            UPDATE TaskList
            SET status = @status, updated_at = GETDATE()
            WHERE id = @taskId AND account_id = @accountId;
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
    createTaskTable,
    addTask,
    deleteTask,
    updateTask,
    getAllTasks,
    getTaskById,
    getTasksByMonth,
    getTasksByDate,
    updateTaskStatus
}; 