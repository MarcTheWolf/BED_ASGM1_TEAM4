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

async function getMedicalConditionByAccountID(accountId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("accountId", sql.Int, accountId);

    const result = await request.query(
      "SELECT * FROM MedicalConditionList WHERE acc_id = @accountId"
    );

    return result.recordset; // Return all medical information for the account
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  } finally {
    if (connection) {
      connection.close();
    }
  }
}

async function createMedicalCondition(accountId, condition) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("accountId", sql.Int, accountId);
    request.input("name", sql.NVarChar, condition.name);
    request.input("descr", sql.NVarChar, condition.descr);
    request.input("prescription_date", sql.DateTime, condition.prescription_date);
    request.input("mod_id", sql.Int, condition.mod_id || accountId);

    const result = await request.query(
      "INSERT INTO MedicalConditionList (name, descr, acc_id, prescription_date, mod_id, updated_at) VALUES (@name, @descr, @accountId, @prescription_date, @mod_id, NULL)"
    );

    return result.rowsAffected > 0;
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  } finally {
    if (connection) {
      connection.close();
    }
  }
}

async function createMedication(accountId, medication) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("accountId", sql.Int, accountId);
    request.input("name", sql.NVarChar, medication.name);
    request.input("description", sql.NVarChar, medication.description);
    request.input("time", sql.NVarChar, medication.time);
    request.input("dosage", sql.NVarChar, medication.dosage);
    request.input("frequency", sql.NVarChar, medication.frequency);
    request.input("start_date", sql.DateTime, medication.start_date);


    const result = await request.query(
      "INSERT INTO MedicationList (account_id, name, description, dosage, time, frequency, start_date) VALUES (@accountId, @name, @description, @dosage, @time, @frequency, @start_date)"
    );

    return result.rowsAffected > 0;
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  } finally {
    if (connection) {
      connection.close();
    }
  }
}

async function deleteMedication(medicationId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("medicationId", sql.Int, medicationId);

    const result = await request.query(
      "DELETE FROM MedicationList WHERE med_id = @medicationId"
    );

    return result.rowsAffected > 0; // Return true if deletion was successful
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  } finally {
    if (connection) {
      connection.close();
    }
  }
}

async function deleteMedicalCondition(conditionId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("conditionId", sql.Int, conditionId);

    const result = await request.query(
      "DELETE FROM MedicalConditionList WHERE medc_id = @conditionId"
    );

    return result.rowsAffected > 0; // Return true if deletion was successful
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
  getMedicationByID,
  getMedicalConditionByAccountID,
  createMedicalCondition,
  createMedication,
  deleteMedication,
  deleteMedicalCondition
};