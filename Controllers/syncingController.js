const syncingModel = require("../Models/syncingModel.js");

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


module.exports = {
    getSyncedAccounts
};