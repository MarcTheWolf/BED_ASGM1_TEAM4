const sql = require("mssql");
const dbConfig = require("../dbConfig");

const { getPool } = require('../Services/pool');

async function getExpenditureGoalByID(accountId) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input("accountId", sql.Int, accountId)
            .query(`
  SELECT 
    month,
    SUM(monthly_goal) AS total_goal
  FROM MonthlyExpenseGoal
  WHERE acc_id = @accountId AND month = FORMAT(GETDATE(), 'yyyy-MM')
  GROUP BY month
`);

            
        return result;
    } catch (error) {
        console.error("Error fetching expenditure goal:", error);
        throw error;
    }
}

async function getTotalExpenditureByID(accountId) {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input("accountId", sql.Int, accountId)
            .query("SELECT SUM(amount) AS total FROM ExpensesList WHERE acc_id = @accountId");

        return result;
    } catch (error) {
        console.error("Error fetching total expenditure:", error);
        throw error;
    }
}

async function getExpenditureGoalPerCategoryMonth(accountId, month) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("accountId", sql.Int, accountId)
      .input("month", sql.NVarChar(7), month) // Fix: use NVarChar and specify length
      .query(`
        SELECT category, monthly_goal
        FROM MonthlyExpenseGoal
        WHERE acc_id = @accountId AND month = @month
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error fetching category expenditure goals:", error);
    throw error;
  }
}


async function getMonthlyExpenditureByID(accountId) {
    try {
        const pool = await getPool();
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
        const pool = await getPool();
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
        const pool = await getPool();
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

async function getAccountBudget(accountId, month) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("accountId", sql.Int, accountId)
      .input("month", sql.NVarChar, month) // e.g., '2025-07'
      .query(`
        SELECT 
          SUM(monthly_goal) AS monthly_goal
        FROM MonthlyExpenseGoal 
        WHERE acc_id = @accountId AND month = @month
      `);

    const goal = result.recordset[0]?.monthly_goal || 0;
    return { monthly_goal: goal, found: goal > 0 };
  } catch (error) {
    console.error("Error fetching account budget:", error);
    throw error;
  }
}


async function addTransactionToAccount(accountId, transaction) {
    try {

        const pool = await getPool();
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

async function addExpenditureGoal(accountId, goals, month) {
  try {
    const pool = await getPool();

    for (const [category, value] of Object.entries(goals)) {
      const formattedCategory = category.trim().toLowerCase();
      const capitalizedCategory = formattedCategory.charAt(0).toUpperCase() + formattedCategory.slice(1);

      const check = await pool.request()
        .input("accountId", sql.Int, accountId)
        .input("category", sql.VarChar(20), capitalizedCategory)
        .input("month", sql.VarChar(7), month)
        .query(`
          SELECT COUNT(*) AS count
          FROM MonthlyExpenseGoal
          WHERE acc_id = @accountId AND category = @category AND month = @month
        `);

      if (check.recordset[0].count === 0) {
        await pool.request()
          .input("accountId", sql.Int, accountId)
          .input("goal", sql.Decimal(10, 2), value)
          .input("category", sql.VarChar(20), capitalizedCategory)
          .input("month", sql.VarChar(7), month)
          .query(`
            INSERT INTO MonthlyExpenseGoal (acc_id, monthly_goal, category, month)
            VALUES (@accountId, @goal, @category, @month)
          `);
      }
    }

    return { message: "Expenditure goals added successfully." };
  } catch (error) {
    console.error("Error adding expenditure goals:", error);
    throw error;
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Modify an existing expenditure goal
async function modifyExpenditureGoal(accountId, newGoals, month) {
  try {
    const pool = await getPool();

    for (const [category, value] of Object.entries(newGoals)) {
      const formattedCategory = category.trim().toLowerCase();
      const capitalizedCategory = formattedCategory.charAt(0).toUpperCase() + formattedCategory.slice(1);

      await pool.request()
        .input("accountId", sql.Int, accountId)
        .input("goal", sql.Decimal(10, 2), value)
        .input("category", sql.VarChar(20), capitalizedCategory)
        .input("month", sql.VarChar(7), month)
        .query(`
          UPDATE MonthlyExpenseGoal
          SET monthly_goal = @goal
          WHERE acc_id = @accountId AND category = @category AND month = @month
        `);
    }

    return { message: "Expenditure goals updated successfully." };
  } catch (error) {
    console.error("Error modifying expenditure goals:", error);
    throw error;
  }
}



async function getTransactionByID(accountId, transactionId) {
    try {
        const pool = await getPool();
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
        const pool = await getPool();
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
        const pool = await getPool();
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
        const pool = await getPool();
        const result = await pool.request()
            .query("SELECT * FROM MonthlyExpenseGoal");

        return result.recordset; // Return the array of all user budgets
    } catch (error) {
        console.error("Error fetching all user budgets:", error);
        throw error;
    }
}

async function getTransportationExpenditure(accountId, month) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("accountId", sql.Int, accountId)
      .input("month", sql.NVarChar, month)
      .query(`
        SELECT SUM(amount) AS total
        FROM ExpensesList
        WHERE acc_id = @accountId AND FORMAT(date, 'yyyy-MM') = @month AND cat = 'transport'
      `);

    return result.recordset[0].total || 0;
  } catch (error) {
    console.error("Error fetching transport expenditure:", error);
    throw error;
  }
}

async function getTransportationGoal(accountId, month) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("accountId", sql.Int, accountId)
      .input("month", sql.NVarChar, month)
      .query(`
        SELECT monthly_goal
        FROM MonthlyExpenseGoal
        WHERE acc_id = @accountId AND month = @month AND category = 'transport'
      `);

    return result.recordset[0]?.monthly_goal || 0;
  } catch (error) {
    console.error("Error fetching transport goal:", error);
    throw error;
  }
}

async function getFoodExpenditure(accountId, month) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("accountId", sql.Int, accountId)
      .input("month", sql.NVarChar, month)
      .query(`
        SELECT SUM(amount) AS total
        FROM ExpensesList
        WHERE acc_id = @accountId AND FORMAT(date, 'yyyy-MM') = @month AND cat = 'food'
      `);

    return result.recordset[0].total || 0;
  } catch (error) {
    console.error("Error fetching food expenditure:", error);
    throw error;
  }
}

async function getFoodGoal(accountId, month) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("accountId", sql.Int, accountId)
      .input("month", sql.NVarChar, month)
      .query(`
        SELECT monthly_goal
        FROM MonthlyExpenseGoal
        WHERE acc_id = @accountId AND month = @month AND category = 'food'
      `);

    return result.recordset[0]?.monthly_goal || 0;
  } catch (error) {
    console.error("Error fetching food goal:", error);
    throw error;
  }
}


async function getUtilityExpenditure(accountId, month) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("accountId", sql.Int, accountId)
      .input("month", sql.NVarChar, month)
      .query(`
        SELECT SUM(amount) AS total
        FROM ExpensesList
        WHERE acc_id = @accountId AND FORMAT(date, 'yyyy-MM') = @month AND cat = 'utilities'
      `);

    return result.recordset[0].total || 0;
  } catch (error) {
    console.error("Error fetching utilities expenditure:", error);
    throw error;
  }
}

async function getUtilityGoal(accountId, month) {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("accountId", sql.Int, accountId)
      .input("month", sql.NVarChar, month)
      .query(`
        SELECT monthly_goal
        FROM MonthlyExpenseGoal
        WHERE acc_id = @accountId AND month = @month AND category = 'utilities'
      `);

    return result.recordset[0]?.monthly_goal || 0;
  } catch (error) {
    console.error("Error fetching utilities goal:", error);
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
    getTransportationExpenditure,
    getTransportationGoal,
    getFoodExpenditure,
    getFoodGoal,
    getUtilityExpenditure,
    getUtilityGoal,
    getExpenditureGoalPerCategoryMonth
};