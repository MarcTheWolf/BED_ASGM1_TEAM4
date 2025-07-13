const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getExpenditureGoalByID(accountId) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("accountId", sql.Int, accountId)
            .query("SELECT * FROM MonthlyExpenseGoal WHERE id = @accountId");

        return result;
    } catch (error) {
        console.error("Error fetching expenditure goal:", error);
        throw error;
    }
}

async function getTotalExpenditureByID(accountId) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("accountId", sql.Int, accountId)
            .query("SELECT SUM(amount) AS total FROM ExpensesList WHERE acc_id = @accountId");

        return result;
    } catch (error) {
        console.error("Error fetching total expenditure:", error);
        throw error;
    }
}

async function getMonthlyExpenditureByID(accountId) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("accountId", sql.Int, accountId)
            .query(`
                SELECT 
                    FORMAT(date, 'yyyy-MM') AS month,
                    SUM(amount) AS total
                FROM ExpensesList
                WHERE acc_id = @accountId
                GROUP BY FORMAT(date, 'yyyy-MM')
                ORDER BY month
            `);

        return result.recordset; // Return the array of { month, total }
    } catch (error) {
        console.error("Error fetching monthly expenditure:", error);
        throw error;
    }
}

module.exports = {
    getExpenditureGoalByID,
    getTotalExpenditureByID,
    getMonthlyExpenditureByID
};