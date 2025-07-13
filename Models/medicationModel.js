const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getMedicationByAccountID(accountId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("accountId", sql.Int, accountId);

    const result = await request.query(
      "SELECT * FROM MedicationList WHERE account_id = @accountId"
    );

    return result.recordset; // Return all medications for the account
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  } finally {
    if (connection) {
      connection.close();
    }
  }
}

async function getMedicationByID(medicationId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("medicationId", sql.Int, medicationId);

    const result = await request.query(
      "SELECT * FROM MedicationList WHERE med_id = @medicationId"
    );

    return result.recordset[0]; // Return the specific medication
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
  getMedicationByAccountID,
  getMedicationByID
};