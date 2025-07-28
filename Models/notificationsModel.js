const sql = require("mssql");
const dbConfig = require("../dbConfig");



async function getAllNotificationsByAccountId(accountId) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("accountId", sql.Int, accountId)
            .query("SELECT * FROM notificationList WHERE acc_id = @accountId ORDER BY time desc");

        return result.recordset; // Return the array of notifications
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
}

async function getUnnotifiedByAccountId(accountId) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("accountId", sql.Int, accountId)
            .query("SELECT * FROM notificationList WHERE acc_id = @accountId AND notified = 0 ORDER BY time desc");

        return result.recordset; // Return the array of unnotified notifications
    }
    catch (error) {
        console.error("Error fetching unnotified notifications:", error);
        throw error;
    }
}

async function markNotificationAsNotified(notiId, accountId) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("notiId", sql.Int, notiId)
            .input("accountId", sql.Int, accountId)
            .query("UPDATE notificationList SET notified = 1 WHERE noti_id = @notiId AND acc_id = @accountId");

        return result;
    } catch (error) {
        console.error("Error marking notification as notified:", error);
        throw error;
    }
}

async function createNotification(payload) {
    if (!payload.type || !payload.acc_id || !payload.description || !payload.time) {
        console.log(payload.type)
  throw new Error("Missing required fields in notification payload.");
}
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("type", sql.VarChar, payload.type)
            .input("acc_id", sql.Int, payload.acc_id)
            .input("description", sql.VarChar, payload.description)
            .input("time", sql.DateTime, payload.time)
            .query("INSERT INTO notificationList (type, acc_id, description, time) VALUES (@type, @acc_id, @description, @time)");
        console.log("Creating notification with payload:", payload);
        return result;
    }
    catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
}

async function hasSentBudgetNotificationThisMonth(accountId) {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .input("accountId", sql.Int, accountId)
        .query(`
            SELECT COUNT(*) AS count
            FROM NotificationList
            WHERE acc_id = @accountId
              AND MONTH(time) = MONTH(GETDATE())
              AND YEAR(time) = YEAR(GETDATE())
              AND type = 'finance'
        `);
    return result.recordset[0].count > 0;
}

module.exports = {
    getAllNotificationsByAccountId,
    getUnnotifiedByAccountId,
    markNotificationAsNotified,
    createNotification,
    hasSentBudgetNotificationThisMonth
};