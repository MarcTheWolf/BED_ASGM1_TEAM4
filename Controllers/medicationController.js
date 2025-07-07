const accountModel = require("../Models/medicationModel.js");

async function getMedicationByAccountID(req, res) {
  try {
    const accountId = parseInt(req.params.id);
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

module.exports = {
  getMedicationByAccountID,
  getMedicationByID
};