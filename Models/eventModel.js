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
                WHERE r.account_id = @account_id
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

module.exports = {
    getEventRegisteredByID,
    getEventDetailsByID
}