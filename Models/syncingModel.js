const sql = require("mssql");
const dbConfig = require("../dbConfig");
const { getPool } = require('../Services/pool');


async function getSyncedAccounts(userId) {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input("userId", sql.Int, userId);

    const result = await request.query(`
      SELECT ap.*
      FROM syncAccounts sa
      JOIN AccountProfile ap
        ON (ap.id = sa.elderly_id OR ap.id = sa.caretaker_id)
      WHERE (sa.elderly_id = @userId OR sa.caretaker_id = @userId)
        AND ap.id != @userId
    `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching synced accounts from database:", error);
    throw new Error("Database query failed");
  }
}

module.exports = {
    getSyncedAccounts
};