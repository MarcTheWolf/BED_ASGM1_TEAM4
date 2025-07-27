const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getEventRegisteredByID(id) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const result = await connection.request()
            .input("account_id", sql.Int, id)  // Use 'id' here
            .query(`
                SELECT 
                    e.banner_image,
                    e.id,
                    e.name,
                    e.description,
                    e.date,
                    e.time,
                    e.location,
                    e.org_id,
                    e.weekly,
                    e.equipment_required
                FROM RegisteredList r
                JOIN EventList e ON r.event_id = e.id
                WHERE r.account_id = @account_id and e.date >= CONVERT(DATE, GETDATE())
                ORDER BY e.date DESC
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

async function getEventDetailsByID(id) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("id", sql.Int, id);

        const result = await request.query(
            "SELECT * FROM EventList WHERE id = @id"
        );

        return result.recordset[0]; // Return first match or undefined
    } catch (error) {
        console.error("Model error:", error);
        throw error;
    } finally {
        if (connection) {
            connection.close();
        }
    }
}

async function getAllEvents() {
    let connection;

    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();

        const result = await request.query("SELECT * FROM EventList WHERE date >= CONVERT(DATE, GETDATE()) ORDER BY date desc");
        return result.recordset; // Return all events
    } catch (error) {
        console.error("Model error:", error);
        throw error;
    } finally {
        if (connection) {
            connection.close();
        }
    }
}

async function registerEvent(accountId, eventId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("accountId", sql.Int, accountId);
        request.input("eventId", sql.Int, eventId);

        const result = await request.query(`
            INSERT INTO RegisteredList (account_id, event_id)
            VALUES (@accountId, @eventId);
        `);

        return result.rowsAffected > 0; // Return true if insert was successful
    } catch (error) {
        console.error("Model error:", error);
        throw error;
    } finally {
        if (connection) {
            connection.close();
        }
    }
}

async function unregisterEvent(accountId, eventId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("accountId", sql.Int, accountId);
        request.input("eventId", sql.Int, eventId);

        const result = await request.query(`
            DELETE FROM RegisteredList
            WHERE account_id = @accountId AND event_id = @eventId;
        `);

        return result.rowsAffected > 0; // Return true if delete was successful
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
    getEventRegisteredByID,
    getEventDetailsByID,
    getAllEvents,
    registerEvent,
    unregisterEvent
}