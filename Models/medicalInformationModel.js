const sql = require("mssql");
const dbConfig = require("../dbConfig");
const { get } = require("../Controllers/mapController");

const { getPool } = require('../Services/pool');

async function getMedicationByAccountID(accountId) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("accountId", sql.Int, accountId);

    const result = await request.query(
      "SELECT * FROM MedicationList WHERE account_id = @accountId"
    );

    return result.recordset; // Return all medications for the account
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function getMedicationByID(medicationId) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("medicationId", sql.Int, medicationId);

    const result = await request.query(
      "SELECT * FROM MedicationList WHERE med_id = @medicationId"
    );

    return result.recordset[0]; // Return the specific medication
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function getMedicalConditionByID(conditionId) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("conditionId", sql.Int, conditionId);

    const result = await request.query(
      "SELECT * FROM MedicalConditionList WHERE medc_id = @conditionId"
    );

    return result.recordset[0]; // Return the specific medical condition
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function getWeeklyTiming(med_id) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("med_id", sql.Int, med_id);

    const result = await request.query(
      "SELECT * FROM WeeklyMedicationTiming WHERE med_id = @med_id"
    );

    return result.recordset; // Return the weekly timing for the medication
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function saveWeeklyTiming(med_id, day, time) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("med_id", sql.Int, med_id);
    request.input("day", sql.Int, day);
    request.input("time", sql.NVarChar, time);

    const result = await request.query(
      "INSERT INTO WeeklyMedicationTiming (med_id, day, time) VALUES (@med_id, @day, @time)"
    );

    return result.rowsAffected > 0; // Return true if insertion was successful
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function getWeeklyTimingsByAccountID(accountId) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("accountId", sql.Int, accountId);

    const result = await request.query(`
      SELECT w.medTime_id, w.med_id, w.day, w.time, m.name, m.frequency
      FROM WeeklyMedicationTiming w
      INNER JOIN MedicationList m ON w.med_id = m.med_id
      WHERE m.account_id = @accountId
    `);

    return result.recordset;
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function getWeeklyTimingsByAccountID(accountId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("accountId", sql.Int, accountId);

    const result = await request.query(`
      SELECT w.medTime_id, w.med_id, w.day, w.time, m.name, m.frequency
      FROM WeeklyMedicationTiming w
      INNER JOIN MedicationList m ON w.med_id = m.med_id
      WHERE m.account_id = @accountId
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


async function getMedicalConditionByAccountID(accountId) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("accountId", sql.Int, accountId);

    const result = await request.query(
      "SELECT * FROM MedicalConditionList WHERE acc_id = @accountId"
    );

    return result.recordset; // Return all medical information for the account
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function createMedicalCondition(accountId, condition) {
  let connection;
  try {
    connection = await getPool();
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
  }
}

async function createMedication(accountId, medication) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("accountId", sql.Int, accountId);
    request.input("name", sql.NVarChar, medication.name);
    request.input("description", sql.NVarChar, medication.description);
    request.input("time", sql.NVarChar, medication.time || null);
    request.input("dosage", sql.NVarChar, medication.dosage);
    request.input("frequency", sql.NVarChar, medication.frequency);
    request.input("start_date", sql.DateTime, medication.start_date);


    const result = await request.query(
      "  INSERT INTO MedicationList (account_id, name, description, dosage, time, frequency, start_date) VALUES (@accountId, @name, @description, @dosage, @time, @frequency, @start_date); SELECT SCOPE_IDENTITY() AS success;"
    );

    return result.recordset[0].success;
    return result.recordset[0].success;
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function deleteMedication(medicationId) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("medicationId", sql.Int, medicationId);

    const result = await request.query(
      "DELETE FROM MedicationList WHERE med_id = @medicationId"
    );

    return result.rowsAffected > 0; // Return true if deletion was successful
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function deleteMedicalCondition(conditionId) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("conditionId", sql.Int, conditionId);

    const result = await request.query(
      "DELETE FROM MedicalConditionList WHERE medc_id = @conditionId"
    );

    return result.rowsAffected > 0; // Return true if deletion was successful
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function getMedicationAssociatedWithMedicalCondition(conditionId) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("conditionId", sql.Int, conditionId);

    const result = await request.query(
      "SELECT * FROM MedicationConditionAssociationList WHERE medc_id = @conditionId"
    );

    return result.recordset; // Return all medications associated with the medical condition
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function updateMedication(med_id, data) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("med_id", sql.Int, med_id);
    request.input("name", sql.NVarChar, data.name);
    request.input("description", sql.NVarChar, data.description || '');
    request.input("dosage", sql.NVarChar, data.dosage);
    request.input("time", sql.NVarChar, data.time || '');
    request.input("frequency", sql.NVarChar, data.frequency);
    request.input("start_date", sql.DateTime, data.start_date);

    const result = await request.query(
      "UPDATE MedicationList SET name = @name, description = @description, dosage = @dosage, time = @time, frequency = @frequency, start_date = @start_date WHERE med_id = @med_id"
    );

    return result.rowsAffected > 0; // Return true if update was successful
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function updateMedicalCondition(medc_id, data) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("medc_id", sql.Int, medc_id);
    request.input("name", sql.NVarChar, data.name);
    request.input("descr", sql.NVarChar, data.descr || '');
    request.input("prescription_date", sql.DateTime, data.prescription_date);
    request.input("mod_id", sql.Int, data.mod_id || medc_id);
    request.input("updated_at", sql.DateTime, data.updated_at); // Use current date and time for updated_at

    const result = await request.query(
      "UPDATE MedicalConditionList SET name = @name, descr = @descr, updated_at = @updated_at, prescription_date = @prescription_date, mod_id = @mod_id WHERE medc_id = @medc_id"
    );

    return result.rowsAffected > 0; // Return true if update was successful
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function associateMedicationWithMedicalCondition(med_id, medc_id) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("med_id", sql.Int, med_id);
    request.input("medc_id", sql.Int, medc_id);

    // Check if the association already exists
    const existingAssociation = await request.query(
      "SELECT * FROM MedicationConditionAssociationList WHERE med_id = @med_id AND medc_id = @medc_id"
    );

    if (existingAssociation.recordset.length > 0) {
      return false; // Association already exists
    }

    const result = await request.query(
      "INSERT INTO MedicationConditionAssociationList (med_id, medc_id) VALUES (@med_id, @medc_id)"
    );

    return result.rowsAffected > 0; // Return true if association was successful
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function deleteMedicationConditionAssociation(med_id, medc_id) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("med_id", sql.Int, med_id);
    request.input("medc_id", sql.Int, medc_id);

    const result = await request.query(
      "DELETE FROM MedicationConditionAssociationList WHERE med_id = @med_id AND medc_id = @medc_id"
    );

    return result.rowsAffected > 0; // Return true if deletion was successful
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

async function resetWeeklyTiming(med_id) {
  let connection;
  try {
    connection = await getPool();
    const request = connection.request();
    request.input("med_id", sql.Int, med_id);

    const result = await request.query(
      "DELETE FROM WeeklyMedicationTiming WHERE med_id = @med_id"
    );

    return result.rowsAffected > 0; // Return true if reset was successful
  } catch (error) {
    console.error("Model error:", error);
    throw error;
  }
}

module.exports = {
  getMedicationByAccountID,
  getMedicationByID,
  getMedicalConditionByAccountID,
  createMedicalCondition,
  createMedication,
  deleteMedication,
  deleteMedicalCondition,
  getMedicalConditionByID,
  getMedicationAssociatedWithMedicalCondition,
  updateMedication,
  updateMedicalCondition,
  associateMedicationWithMedicalCondition,
  deleteMedicationConditionAssociation,
  getWeeklyTiming,
  saveWeeklyTiming,
  resetWeeklyTiming,
  getWeeklyTimingsByAccountID
};