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

async function getExpenditureForMonth(accountId, month) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("accountId", sql.Int, accountId)
            .input("month", sql.NVarChar, month) // format: '2025-07'
            .query(`
                -- First: return all expenses
                SELECT 
                    entry_id, 
                    acc_id, 
                    amount, 
                    FORMAT(date, 'yyyy-MM-dd') AS date,
                    description,
                    cat
                FROM ExpensesList
                WHERE acc_id = @accountId AND FORMAT(date, 'yyyy-MM') = @month
                ORDER BY date DESC;

                -- Second: return total amount
                SELECT 
                    SUM(amount) AS total
                FROM ExpensesList
                WHERE acc_id = @accountId AND FORMAT(date, 'yyyy-MM') = @month;
            `);

        const transactions = result.recordsets[0]; // first result set
        const total = result.recordsets[1][0].total || 0; // second result set

        return { transactions, total };
    } catch (error) {
        console.error("Error fetching expenditure for month:", error);
        throw error;
    }
}

async function getAllTransactionsByID(accountId) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("accountId", sql.Int, accountId)
            .query(`
                SELECT 
                    entry_id, 
                    acc_id, 
                    amount, 
                    date, 
                    description ,
                    cat
                FROM ExpensesList
                WHERE acc_id = @accountId
                ORDER BY date DESC
            `);
        return result.recordset; // Return the array of transactions
    } catch (error) {
        console.error("Error fetching all transactions:", error);
        throw error;
    }
}

async function getAccountBudget(accountId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("accountId", sql.Int, accountId)
      .query("SELECT monthly_goal FROM MonthlyExpenseGoal WHERE id = @accountId");

    // ✅ Return default if no record is found
    if (result.recordset.length === 0) {
      return { monthly_goal: 0, found: false };
    }

    return result.recordset[0]; // Return the existing budget object
  } catch (error) {
    console.error("Error fetching account budget:", error);
    throw error;
  }
}

async function addTransactionToAccount(accountId, transaction) {
    try {

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input("accountId", sql.Int, accountId)
            .input("amount", sql.Decimal(10, 2), transaction.amount)
            .input("date", sql.DateTime, transaction.date)
            .input("description", sql.NVarChar, transaction.description)
            .input("category", sql.NVarChar, transaction.category)
            .query(`
                INSERT INTO ExpensesList (acc_id, amount, date, description, cat)
                VALUES (@accountId, @amount, @date, @description, @category)
            `);

        return { message: "Transaction added successfully" };
    } catch (error) {
        console.error("Error adding transaction:", error);
        return { message: "Internal server error" };
    }
}   

module.exports = {
    getExpenditureGoalByID,
    getTotalExpenditureByID,
    getMonthlyExpenditureByID,
    getAllTransactionsByID,
    getAccountBudget,
    getExpenditureForMonth,
    addTransactionToAccount
};