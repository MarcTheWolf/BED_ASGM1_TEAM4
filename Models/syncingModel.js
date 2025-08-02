const sql = require("mssql");
const dbConfig = require("../dbConfig");
const { getPool } = require('../Services/pool');


async function getSyncedAccounts(userId) {
    try {
        const pool = await getPool();
        const request = pool.request();
        request.input("userId", sql.Int, userId);
        const result = await request.query("SELECT * FROM syncAccounts WHERE elderly_id = @userId OR caretaker_id = @userId");
        return result.recordset;
    } catch (error) {
        console.error("Error fetching synced accounts from database:", error);
        throw new Error("Database query failed");
    }
}

module.exports = {
    getSyncedAccounts
};