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
        console.log(notiId)
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("notiId", sql.Int, notiId)
            .input("accountId", sql.Int, accountId)
            .query("UPDATE notificationList SET notified = 1 WHERE noti_id = @notiId AND acc_id = @accountId");
        console.log("Notification marked as notified:", result.rowsAffected[0]);
        return result;
    } catch (error) {
        console.error("Error marking notification as notified:", error);
        throw error;
    }
}

async function createNotification(payload) {
  if (!payload.type || !payload.acc_id || !payload.description || !payload.time) {
    throw new Error("Missing required fields in notification payload.");
  }

  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    request
      .input("type", sql.VarChar, payload.type)
      .input("acc_id", sql.Int, payload.acc_id)
      .input("description", sql.VarChar, payload.description)
      .input("time", sql.DateTime, payload.time);

    let query;

    if (payload.asso_id !== undefined) {
      request.input("asso_id", sql.Int, payload.asso_id);
      query = `
        INSERT INTO notificationList (type, acc_id, description, time, asso_id)
        OUTPUT INSERTED.noti_id
        VALUES (@type, @acc_id, @description, @time, @asso_id)
      `;
    } else {
      query = `
        INSERT INTO notificationList (type, acc_id, description, time)
        OUTPUT INSERTED.noti_id
        VALUES (@type, @acc_id, @description, @time)
      `;
    }

    const result = await request.query(query);
    const noti_id = result.recordset[0]?.noti_id;

    console.log("Notification created with noti_id:", noti_id);
    return noti_id;

  } catch (error) {
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
              AND type = 'finance'
        `);
    return result.recordset[0].count > 0;
}

async function hasSentMedicationNotificationToday(med_id) {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input("med_id", sql.Int, med_id);

    const result = await request.query(`
      SELECT 1
      FROM notificationList
      WHERE type = 'medication'
        AND asso_id = @med_id
        AND CAST(DATEADD(HOUR, 8, time) AS DATE) = CAST(GETDATE() AS DATE)
    `);

    const alreadySent = result.recordset.length > 0;
    return alreadySent;
  } catch (err) {
    console.error("Error checking medication notification:", err);
    throw err;
  }
}


async function hasSentMedicationNotificationPerTiming(medTime_id) {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input("medTime_id", sql.Int, medTime_id);

    const result = await request.query(`
      SELECT 1
      FROM notificationList
      WHERE type = 'weekly'
        AND asso_id = @medTime_id
        AND CAST(DATEADD(HOUR, 8, time) AS DATE) = CAST(GETDATE() AS DATE)
    `);

    return result.recordset.length > 0;
  } catch (error) {
    console.error("Error checking weekly medication notification:", error);
    throw error;
  }
}

async function hasSentEventNotificationForEvent(eventId, accountId) {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input("event_id", sql.Int, eventId);
    request.input("acc_id", sql.Int, accountId);

    const result = await request.query(`
      SELECT 1
      FROM notificationList
      WHERE type = 'event'
        AND asso_id = @event_id
        AND acc_id = @acc_id
        AND CAST(DATEADD(HOUR, 8, time) AS DATE) = CAST(GETDATE() AS DATE)
    `);

    return result.recordset.length > 0;
  } catch (err) {
    console.error("Error checking event notification:", err);
    throw err;
  }
}
  
module.exports = {
    getAllNotificationsByAccountId,
    getUnnotifiedByAccountId,
    markNotificationAsNotified,
    createNotification,
    hasSentBudgetNotificationThisMonth,
    hasSentMedicationNotificationToday,
    hasSentMedicationNotificationPerTiming,
    hasSentMedicationNotificationPerTiming,
    hasSentEventNotificationForEvent
};