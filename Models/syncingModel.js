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
  try {
    const pool = await getPool();
    const request = pool.request();
    console.log("Checking sync code existence:", syncCode);
request.input("syncCode", sql.VarChar(6), syncCode.toString());
    const result = await request.query(`
      SELECT COUNT(*) AS count
      FROM syncCodes
      WHERE code = @syncCode
    `);
    return result.recordset[0].count > 0;
  } catch (error) {
    console.error("Error checking sync code existence:", error);
    throw new Error("Database query failed");
  }
}

async function createSyncRequest(userId, syncCode) {
  try {
    const syncCodeInt = parseInt(syncCode, 10); // ensure number
    const pool = await getPool();
    const request = pool.request();
    request.input("userId", sql.Int, userId);
    request.input("syncCode", sql.Int, syncCodeInt);
    await request.query(`
      INSERT INTO syncCodes (acc_id, code)
      VALUES (@userId, @syncCode)
    `);
    return true;
  } catch (error) {
    console.error("Error creating sync request in database:", error);
    throw new Error("Database query failed");
  }
}


async function checkSyncCodeExists(syncCode) {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input("syncCode", sql.VarChar, syncCode);
    const result = await request.query(`
      SELECT *
      FROM syncCodes
      WHERE code = @syncCode
    `);
    if (result.recordset.length > 0) {
      return result.recordset[0];
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error checking sync code existence:", error);
    throw new Error("Database query failed");
  }
}

async function linkAccounts(elderly_id, caretaker_id) {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input("elderly_id", sql.Int, elderly_id);
    request.input("caretaker_id", sql.Int, caretaker_id);
    await request.query(`
      INSERT INTO syncAccounts (elderly_id, caretaker_id)
      VALUES (@elderly_id, @caretaker_id)
    `);
  } catch (error) {
    console.error("Error linking accounts in database:", error);
    throw new Error("Database query failed");
  }
}

module.exports = {
    getSyncedAccounts,
    checkSyncCodeExists,
    createSyncRequest,
    linkAccounts
};