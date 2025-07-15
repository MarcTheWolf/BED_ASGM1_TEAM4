const accountModel = require("../Models/medicalInformationModel.js");

async function getMedicationByAccountID(req, res) {
  try {
    const accountId = parseInt(req.user.id);
    if (isNaN(accountId)) {
      return res.status(400).json({ error: "Invalid account ID." });
    }

    const medications = await accountModel.getMedicationByAccountID(accountId);

    if (!medications) {
      return res.status(404).json({ error: "No medications found for this account." });
    }

    res.status(200).json(medications);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function getMedicationByID(req, res) {
  try {
    const medicationId = parseInt(req.params.id);
    if (isNaN(medicationId)) {
      return res.status(400).json({ error: "Invalid medication ID." });
    }
    const medication = await accountModel.getMedicationByID(medicationId);
    if (!medication) {
      return res.status(404).json({ error: "Medication not found." });
    }
    res.status(200).json(medication);
  }
  catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function getMedicalConditionByAccountID(req, res) {
  try {
    const accountId = parseInt(req.user.id);
    if (isNaN(accountId)) {
      return res.status(400).json({ error: "Invalid account ID." });
    }

    const medicalInfo = await accountModel.getMedicalConditionByAccountID(accountId);

    if (!medicalInfo) {
      return res.status(404).json({ error: "No medical information found for this account." });
    }

    res.status(200).json(medicalInfo);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function createMedicalCondition(req, res) {
  try {
    const accountId = parseInt(req.user.id);
    if (isNaN(accountId)) {
      return res.status(400).json({ error: "Invalid account ID." });
    }

    const condition = req.body;
    if (!condition || !condition.name || !condition.descr || !condition.prescription_date) {
      return res.status(400).json({ error: "Invalid condition data." });
    }

    const success = await accountModel.createMedicalCondition(accountId, condition);
    if (!success) {
      return res.status(500).json({ error: "Failed to create medical condition." });
    }

    res.status(201).json({ message: "Medical condition created successfully." });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function createMedication(req, res) {
  try {
    const accountId = parseInt(req.user.id);
    if (isNaN(accountId)) {
      return res.status(400).json({ error: "Invalid account ID." });
    }

    const medication = req.body;
    if (!medication || !medication.name || !medication.dosage || !medication.frequency) {
      return res.status(400).json({ error: "Invalid medication data." });
    }

    const success = await accountModel.createMedication(accountId, medication);
    if (!success) {
      return res.status(500).json({ error: "Failed to create medication." });
    }

    res.status(201).json({ message: "Medication created successfully." });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function deleteMedication(req, res) {
  try {
    const medicationId = parseInt(req.params.id);
    if (isNaN(medicationId)) {
      return res.status(400).json({ error: "Invalid medication ID." });
    }

    const success = await accountModel.deleteMedication(medicationId);
    if (!success) {
      return res.status(404).json({ error: "Medication not found or could not be deleted." });
    }

    res.status(200).json({ message: "Medication deleted successfully." });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function deleteMedicalCondition(req, res) {
  try {
    const conditionId = parseInt(req.params.id);
    if (isNaN(conditionId)) {
      return res.status(400).json({ error: "Invalid condition ID." });
    }

    const success = await accountModel.deleteMedicalCondition(conditionId);
    if (!success) {
      return res.status(404).json({ error: "Medical condition not found or could not be deleted." });
    }

    res.status(200).json({ message: "Medical condition deleted successfully." });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
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