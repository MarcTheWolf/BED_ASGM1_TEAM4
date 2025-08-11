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

async function checkSyncCodeExists(syncCode) {
    const pool = await getPool();
    const request = pool.request();
    request.input("syncCode", sql.VarChar(6), syncCode.toString());
    const result = await request.query(`
        SELECT COUNT(*) AS count
        FROM syncCodes
        WHERE code = @syncCode
    `);
    return result.recordset[0].count > 0;
}

async function createSyncRequest(accountId, syncCode) {
    const pool = await getPool();
    const request = pool.request();

    request.input("code", sql.VarChar(6), syncCode.toString()); // ✅ convert to string
    request.input("acc_id", sql.Int, accountId);

    await request.query(`
        INSERT INTO syncCodes (code, acc_id)
        VALUES (@code, @acc_id)
    `);
}

async function checkSyncCodeValid(syncCode) {
  const pool = await getPool();
  const request = pool.request();
  request.input("syncCode", sql.VarChar(6), syncCode.toString());
  const result = await request.query(`
    SELECT acc_id
    FROM syncCodes
    WHERE code = @syncCode
  `);

  return result.recordset[0] || null; // return the record (with acc_id), or null
}

async function linkAccounts(elderly_id, caretaker_id) {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input("elderly_id", sql.Int, elderly_id);
    request.input("caretaker_id", sql.Int, caretaker_id);

    const result = await request.query(`
      INSERT INTO syncAccounts (elderly_id, caretaker_id)
      VALUES (@elderly_id, @caretaker_id)
    `);

    return result.rowsAffected[0] > 0; // returns true if insert succeeded
  } catch (error) {
    console.error("Error linking accounts in database:", error);
    throw new Error("Database query failed");
  }
}
async function deleteSyncCode(syncCode) {

    const pool = await getPool();
    const request = pool.request();
    request.input("syncCode", sql.VarChar(6), syncCode.toString());
    await request.query(`
        DELETE FROM syncCodes
        WHERE code = @syncCode
    `);
}

module.exports = {
    getSyncedAccounts,
    checkSyncCodeExists,
    createSyncRequest,
    linkAccounts,
    checkSyncCodeValid,
    deleteSyncCode
};