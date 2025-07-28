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

async function addExpenditureGoal(accountId, goal) {
  try {
    const pool = await sql.connect(dbConfig);

    // Check if an expenditure goal already exists for this account
    const existingRecord = await pool.request()
      .input("accountId", sql.Int, accountId)
      .query("SELECT COUNT(*) AS count FROM MonthlyExpenseGoal WHERE id = @accountId");

    // If the record exists, return a message
    if (existingRecord.recordset[0].count > 0) {
      return { message: "Expenditure goal already exists for this account" };
    }

    // Insert the new goal if no record exists
    await pool.request()
      .input("accountId", sql.Int, accountId)
      .input("monthlyGoal", sql.Decimal(10, 2), goal)  // Ensure the correct property name
      .query(`
        INSERT INTO MonthlyExpenseGoal (id, monthly_goal)
        VALUES (@accountId, @monthlyGoal)
      `);

    return { message: "Expenditure goal added successfully" };
  } catch (error) {
    console.error("Error adding expenditure goal:", error);
    throw error;  // Let the caller handle the error
  }
}
// Modify an existing expenditure goal
async function modifyExpenditureGoal(accountId, newGoal) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("accountId", sql.Int, accountId)
      .input("newGoal", sql.Decimal(10, 2), newGoal)
      .query(`
        UPDATE MonthlyExpenseGoal
        SET monthly_goal = @newGoal
        WHERE id = @accountId
      `);

    return { message: "Expenditure goal updated successfully" };
  } catch (error) {
    console.error("Error updating expenditure goal:", error);
    throw error;
  }
}

async function getTransactionByID(accountId, transactionId) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("accountId", sql.Int, accountId)
            .input("transactionId", sql.Int, transactionId)
            .query(`
                SELECT 
                    entry_id, 
                    acc_id, 
                    amount, 
                    date, 
                    description,
                    cat
                FROM ExpensesList
                WHERE acc_id = @accountId AND entry_id = @transactionId
            `);

        // Ensure we're returning a valid transaction object or an empty array to avoid further errors
        if (result.recordset.length === 0) {
            return []; // Return an empty array if no records found
        }

        return result.recordset[0]; // Return the transaction object
    } catch (error) {
        console.error("Error fetching transaction by ID:", error);
        throw error; // Ensure to propagate the error to the controller
    }
}

async function updateTransaction(accountId, transactionId, updatedTransaction) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("accountId", sql.Int, accountId)
            .input("transactionId", sql.Int, transactionId)
            .input("amount", sql.Decimal(10, 2), updatedTransaction.amount)
            .input("date", sql.DateTime, updatedTransaction.date)
            .input("description", sql.NVarChar, updatedTransaction.description)
            .input("category", sql.NVarChar, updatedTransaction.cat)
            .query(`
                UPDATE ExpensesList
                SET amount = @amount,
                    date = @date,
                    description = @description,
                    cat = @category
                WHERE acc_id = @accountId AND entry_id = @transactionId
            `);

        if (result.rowsAffected[0] === 0) {
            return { message: "No transaction found to update" };
        }

        return { message: "Transaction updated successfully" };
    } catch (error) {
        console.error("Error updating transaction:", error);
        throw error; // Propagate the error to the controller
    }
}

async function deleteTransaction(accountId, transactionId) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input("accountId", sql.Int, accountId)
            .input("transactionId", sql.Int, transactionId)
            .query(`
                DELETE FROM ExpensesList
                WHERE acc_id = @accountId AND entry_id = @transactionId
            `);

        if (result.rowsAffected[0] === 0) {
            return { message: "No transaction found to delete" };
        }

        return { message: "Transaction deleted successfully" };
    } catch (error) {
        console.error("Error deleting transaction:", error);
        throw error; // Propagate the error to the controller
    }
}

async function getAllUserBudget() {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query("SELECT * FROM MonthlyExpenseGoal");

        return result.recordset; // Return the array of all user budgets
    } catch (error) {
        console.error("Error fetching all user budgets:", error);
        throw error;
    }
}



module.exports = {
    getExpenditureGoalByID,
    getTotalExpenditureByID,
    getMonthlyExpenditureByID,
    getAllTransactionsByID,
    getAccountBudget,
    getExpenditureForMonth,
    addTransactionToAccount,
    addExpenditureGoal,
    modifyExpenditureGoal,
    getTransactionByID,
    updateTransaction,
    deleteTransaction,
    getAllUserBudget,
};