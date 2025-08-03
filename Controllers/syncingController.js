const syncingModel = require("../Models/syncingModel.js");
const twilio = require("../Services/twilioMessaging.js");

async function getSyncedAccounts(req, res) {
    try {
        const userId = req.user.id;
        const syncedAccounts = await syncingModel.getSyncedAccounts(userId);
        res.status(200).json(syncedAccounts);
    } catch (error) {
        console.error("Error fetching synced accounts:", error);
        res.status(500).json({ error: "Failed to fetch synced accounts" });
    }
}


async function createSyncRequest(req, res) {
    const id = req.user.id;
    const { phone_number } = req.body;

    if (!phone_number) {
        return res.status(400).json({ error: "Phone number is required." });
    }

    let syncCode;
    let isUnique = false;

    try {
        // Loop until a unique sync code is generated
        while (!isUnique) {
            syncCode = generate6DigitCode();
            const exists = await syncingModel.checkSyncCodeExists(syncCode); // returns true/false
            if (!exists) {
                isUnique = true;
            }
        }

        console.log("Generated new unique sync code:", syncCode);

        // Store syncCode and elderly's account ID
        await syncingModel.createSyncRequest(id, syncCode);

        // Send SMS via Twilio
        const message = `To sync your account with a caretaker, please ask them to enter this code: ${syncCode}`;
        await twilio.sendTwilioMessage(phone_number, message);

        res.status(201).json({ message: "Sync request created successfully.", syncCode });
    } catch (error) {
        console.error("Error creating sync request:", error);
        res.status(500).json({ error: "Failed to create sync request." });
    }
}

function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000);
}


async function linkFromCode(req, res) {
    const { syncCode } = req.body;
    const userId = req.user.id;


    if (!syncCode) {
        return res.status(400).json({ error: "Sync code is required." });
    }

    try {
        const isValid = await syncingModel.checkSyncCodeValid(syncCode);
        if (!isValid) {
            return res.status(400).json({ error: "Invalid sync code." });
        }
        const elderlyId = isValid.acc_id;
        const linked = await syncingModel.linkAccounts(elderlyId, userId);

        if (linked) {
        console.log(`Accounts linked: Elderly ID ${elderlyId}, Caretaker ID ${userId}`);
        await syncingModel.deleteSyncCode(syncCode);
        }
        res.status(200).json({ message: "Accounts linked successfully." });
    } catch (error) {
        console.error("Error linking accounts:", error);
        res.status(500).json({ error: "Failed to link accounts." });
    }
}


module.exports = {
    getSyncedAccounts,
    createSyncRequest,
    linkFromCode
};