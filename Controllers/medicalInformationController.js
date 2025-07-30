const medicalModel = require("../Models/medicalInformationModel.js");

async function getMedicationByAccountID(req, res) {
  try {
    const accountId = parseInt(req.user.id);
    if (isNaN(accountId)) {
      return res.status(400).json({ error: "Invalid account ID." });
    }

    const medications = await medicalModel.getMedicationByAccountID(accountId);

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
    const medication = await medicalModel.getMedicationByID(medicationId);
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

async function getMedicalConditionByID(req, res) {
  try {
    const conditionId = parseInt(req.params.id);
    if (isNaN(conditionId)) {
      return res.status(400).json({ error: "Invalid condition ID." });
    }
    const condition = await medicalModel.getMedicalConditionByID(conditionId);
    if (!condition) {
      return res.status(404).json({ error: "Medical condition not found." });
    }
    res.status(200).json(condition);
  } catch (error) {
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

    const medicalInfo = await medicalModel.getMedicalConditionByAccountID(accountId);

    if (!medicalInfo) {
      return res.status(404).json({ error: "No medical information found for this account." });
    }

    res.status(200).json(medicalInfo);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function getWeeklyTiming(req, res) {
  try {
    const medicationId = parseInt(req.params.med_id);
    if (isNaN(medicationId)) {
      return res.status(400).json({ error: "Invalid medication ID." });
    }
    const weeklyTiming = await medicalModel.getWeeklyTiming(medicationId);
    if (!weeklyTiming) {
      return res.status(404).json({ error: "Weekly timing not found for this medication." });
    }
    res.status(200).json(weeklyTiming);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function saveWeeklyTiming(req, res) {
  try {
    const { med_id, day, time } = req.body;
    if (!med_id || !day || !time) {
      return res.status(400).json({ error: "Medication ID, day, and time are required." });
    }
    const success = await medicalModel.saveWeeklyTiming(med_id, day, time);
    if (!success) {
      return res.status(500).json({ error: "Failed to save weekly timing." });
    }
    res.status(200).json({ message: "Weekly timing saved successfully." });
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

    const success = await medicalModel.createMedicalCondition(accountId, condition);
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

    const success = await medicalModel.createMedication(accountId, medication);
    if (!success) {
      return res.status(500).json({ error: "Failed to create medication." });
    }

    res.status(201).json({ message: "Medication created successfully.", med_id: success});
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

    const success = await medicalModel.deleteMedication(medicationId);
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

    const success = await medicalModel.deleteMedicalCondition(conditionId);
    if (!success) {
      return res.status(404).json({ error: "Medical condition not found or could not be deleted." });
    }

    res.status(200).json({ message: "Medical condition deleted successfully." });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function getMedicationAssociatedWithMedicalCondition(req, res) {
  try {
    const conditionId = parseInt(req.params.id);
    if (isNaN(conditionId)) {
      return res.status(400).json({ error: "Invalid condition ID." });
    }

    const medicationIds = await medicalModel.getMedicationAssociatedWithMedicalCondition(conditionId);
    if (!medicationIds || medicationIds.length === 0) {
      return res.status(404).json({ error: "No medications found for this medical condition." });
    }

    // Fetch all medication details in parallel
    const medicationPromises = medicationIds.map(el => medicalModel.getMedicationByID(el.med_id));
    const medications = await Promise.all(medicationPromises);

    res.status(200).json(medications);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function updateMedication(req, res) {
  try {
    const medicationId = parseInt(req.params.id);
    if (isNaN(medicationId)) {
      return res.status(400).json({ error: "Invalid medication ID." });
    }

    const medicationData = req.body;
    if (!medicationData || !medicationData.name || !medicationData.dosage || !medicationData.frequency) {
      return res.status(400).json({ error: "Invalid medication data." });
    }

    const success = await medicalModel.updateMedication(medicationId, medicationData);
    if (!success) {
      return res.status(404).json({ error: "Medication not found or could not be updated." });
    }

    res.status(200).json({ message: "Medication updated successfully." });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function updateMedicalCondition(req, res) {
  try {
    const conditionId = parseInt(req.params.id);
    if (isNaN(conditionId)) {
      return res.status(400).json({ error: "Invalid condition ID." });
    }

    const conditionData = req.body;
    if (!conditionData || !conditionData.name || !conditionData.descr || !conditionData.prescription_date) {
      return res.status(400).json({ error: "Invalid medical condition data." });
    }

    const success = await medicalModel.updateMedicalCondition(conditionId, conditionData);
    if (!success) {
      return res.status(404).json({ error: "Medical condition not found or could not be updated." });
    }

    res.status(200).json({ message: "Medical condition updated successfully." });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function associateMedicationWithMedicalCondition(req, res) {
  try {
    const { med_id, medc_id } = req.body;
    if (!med_id || !medc_id) {
      return res.status(400).json({ error: "Medication ID and Medical Condition ID are required." });
    }

    const success = await medicalModel.associateMedicationWithMedicalCondition(med_id, medc_id);
    if (!success) {
      return res.status(500).json({ error: "Failed to associate medication with medical condition." });
    }

    res.status(200).json({ message: "Medication associated with medical condition successfully." });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function deleteMedicationConditionAssociation(req, res) {
  try {
    const { med_id, medc_id } = req.body;
    if (!med_id || !medc_id) {
      return res.status(400).json({ error: "Medication ID and Medical Condition ID are required." });
    }

    const success = await medicalModel.deleteMedicationConditionAssociation(med_id, medc_id);
    if (!success) {
      return res.status(404).json({ error: "Association not found or could not be deleted." });
    }

    res.status(200).json({ message: "Association deleted successfully." });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}


async function autocompleteMedicalCondition(req, res) {
  const query = req.params.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({ error: "Query string is required" });
  }

  const apiUrl = `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=${encodeURIComponent(query)}&maxList=10&count=10&df=consumer_name&sf=consumer_name`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return res.status(200).json({ suggestions: data[3] }); // The fourth element contains the result list
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch condition suggestions" });
  }
}



async function autocompleteMedication(req, res) {
  const query = req.params.query;

  if (!query || query.length < 2) {
    return res.status(400).json({ error: "Query too short" });
  }

  try {
    const apiUrl = `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${encodeURIComponent(query)}&maxList=10`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // data[1] contains the matched medication names
    const suggestions = data[1] || [];

    res.json({ suggestions });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch medication data" });
  }
}

async function resetWeeklyTiming(req, res) {
  try {
    const med_id = parseInt(req.params.med_id);
    if (isNaN(med_id)) {
      return res.status(400).json({ error: "Invalid medication ID." });
    }

    const success = await medicalModel.resetWeeklyTiming(med_id);
    if (!success) {
      return res.status(404).json({ error: "Weekly timing not found or could not be reset." });
    }

    res.status(200).json({ message: "Weekly timing reset successfully." });
  }
  catch (error) {
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
  deleteMedicalCondition,
  getMedicalConditionByID,
  getMedicationAssociatedWithMedicalCondition,
  updateMedication,
  updateMedicalCondition,
  associateMedicationWithMedicalCondition,
  deleteMedicationConditionAssociation,
  getWeeklyTiming,
  saveWeeklyTiming,
  autocompleteMedicalCondition,
  autocompleteMedication,
  resetWeeklyTiming
  
};