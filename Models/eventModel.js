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

        const result = await request.query("SELECT * FROM EventList ORDER BY date desc");
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

async function createEvent(eventData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("name", sql.NVarChar, eventData.name);
        request.input("description", sql.NVarChar, eventData.description);
        request.input("date", sql.DateTime, eventData.date);
        request.input("time", sql.NVarChar, eventData.time);
        request.input("location", sql.NVarChar, eventData.location);
        request.input("org_id", sql.Int, parseInt(eventData.org_id));
        request.input("weekly", sql.Bit, eventData.weekly ? 1 : 0);
        request.input("equipment_required", sql.NVarChar, eventData.equipment_required || null);
        request.input("banner_image", sql.NVarChar, "");

        console.log(eventData);

        const result = await request.query(`
            INSERT INTO EventList (name, description, date, time, location, org_id, weekly, equipment_required, banner_image)
            VALUES (@name, @description, @date, @time, @location, @org_id, @weekly, @equipment_required, @banner_image);
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

async function updateEvent(eventId, eventData) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("id", sql.Int, eventId);
        request.input("name", sql.NVarChar, eventData.name);
        request.input("description", sql.NVarChar, eventData.description);
        request.input("date", sql.DateTime, eventData.date);
        request.input("time", sql.NVarChar, eventData.time);
        request.input("location", sql.NVarChar, eventData.location);
        request.input("org_id", sql.Int, eventData.org_id);
        request.input("weekly", sql.Bit, eventData.weekly ? 1 : 0);
        request.input("equipment_required", sql.NVarChar, eventData.equipment_required);
        request.input("banner_image", sql.NVarChar, eventData.banner_image || "");


        const result = await request.query(`
            UPDATE EventList
            SET name = @name,
                description = @description,
                date = @date,
                time = @time,
                location = @location,
                org_id = @org_id,
                weekly = @weekly,
                equipment_required = @equipment_required,
                banner_image = @banner_image
            WHERE id = @id;
        `);

        return result.rowsAffected > 0; // Return true if update was successful
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
    createEvent,
    updateEvent,
    registerEvent,
    unregisterEvent
};