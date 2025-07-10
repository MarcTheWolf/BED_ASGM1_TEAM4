const accountModel = require("../Models/financeModel.js");

async function getExpenditureGoalByID(req, res) {
    try {
        const accountId = req.params.id;
        const result = await accountModel.getExpenditureGoalByID(accountId);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "No expenditure goal found for this account." });
        }
        
        res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error("Error fetching expenditure goal:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getTotalExpenditureByID(req, res) {
    try {
        const accountId = req.params.id;
        const result = await accountModel.getTotalExpenditureByID(accountId);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "No expenditure records found for this account." });
        }
        
        res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error("Error fetching total expenditure:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getMonthlyExpenditureByID(req, res) {
    try {
        const accountId = req.params.id;
        const recordset = await accountModel.getMonthlyExpenditureByID(accountId);

        if (!recordset || recordset.length === 0) {
            return res.status(404).json({ message: "No monthly expenditure records found for this account." });
        }

        res.status(200).json(recordset);
    } catch (error) {
        console.error("Error fetching monthly expenditure:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    getExpenditureGoalByID,
    getTotalExpenditureByID,
    getMonthlyExpenditureByID
};