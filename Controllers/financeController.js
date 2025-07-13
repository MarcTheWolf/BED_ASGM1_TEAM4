const { text } = require("express");
const financeModel = require("../Models/financeModel.js");

async function getExpenditureGoalByID(req, res) {
    try {
        const accountId = req.params.id;
        const result = await financeModel.getExpenditureGoalByID(accountId);
        
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
        const result = await financeModel.getTotalExpenditureByID(accountId);
        
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
        const recordset = await financeModel.getMonthlyExpenditureByID(accountId);

        if (!recordset || recordset.length === 0) {
            return res.status(404).json({ message: "No monthly expenditure records found for this account." });
        }

        res.status(200).json(recordset);
    } catch (error) {
        console.error("Error fetching monthly expenditure:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getExpenditureByMonthBarChart(req, res) {
  try {
    const userId = req.params.id;
    const data = await financeModel.getMonthlyExpenditureByID(userId);

    if (!Array.isArray(data)) {
      return res.status(500).json({ message: "Invalid data format from DB" });
    }

    const recentData = data
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    const monthLabels = recentData.map(entry => {
      const [year, month] = entry.month.split('-');
      return new Date(`${year}-${month.padStart(2, '0')}-01`).toLocaleString('default', { month: 'long' });
    });

    const amounts = recentData.map(entry => entry.total);
    const minValue = Math.min(...amounts);
    const maxValue = Math.max(...amounts);
    const yMin = Math.max(0, Math.floor(minValue * 0.8));

    // Gradient shade generator
    const getShade = (value) => {
      const ratioLinear = (value - minValue) / (maxValue - minValue || 1);
      const easedRatio = Math.pow(ratioLinear, 2.5);
      const lightBase = 200;
      const darkBase = 40;
      const shade = Math.floor(lightBase - (lightBase - darkBase) * easedRatio);
      return `rgb(${shade}, ${shade + 20}, ${shade + 50})`;
    };

    const backgroundColors = amounts.map(getShade);

    const chartData = {
      type: 'bar',
      data: {
        labels: monthLabels,
        datasets: [{
          label: 'Monthly Expenditure (S$)',
          data: amounts,
          backgroundColor: backgroundColors,
          borderRadius: 20,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Monthly Spending Overview (Last 5 Months)'
          },
          legend: {
            display: false
          }
        },
        layout: {
          padding: { bottom: 10 }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: yMin,
            max: Math.ceil(maxValue * 1.05),
            title: {
              display: true,
              text: 'Amount (S$)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          }
        }
      }
    };

    const chartUrl = 'https://quickchart.io/chart?c=' + encodeURIComponent(JSON.stringify(chartData)) + '&version=3';


    res.json({ chartUrl });


  } catch (error) {
    console.error("Error generating chart:", error);
    res.status(500).json({ message: "Failed to generate chart" });
  }
}

async function getAllTransactionsByID(req, res) {
    try {
        const accountId = req.params.id;
        const transactions = await financeModel.getAllTransactionsByID(accountId);

        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ message: "No transactions found for this account." });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getBudgetExpenditureDoughnutChart(req, res) {
  try {
    const userId = req.params.id;
    const month = req.params.month; // format: 'YYYY-MM'

    // Fetch expenditures and budget
    const { transactions, total } = await financeModel.getExpenditureForMonth(userId, month);
    let budgetData = await financeModel.getAccountBudget(userId);

    // If budgetData is null/undefined OR monthly_goal is missing, default it to 0
    if (!budgetData || budgetData.monthly_goal == null) {
      budgetData = { monthly_goal: 0 };
    }

    if (!Array.isArray(transactions) || budgetData == null || budgetData.monthly_goal == null) {
      return res.status(500).json({ message: "Invalid data from database" });
    }

    const totalSpent = total || 0;
    const budget = parseFloat(budgetData.monthly_goal);
    const remaining = Math.max(budget - totalSpent, 0);

    const spentPercentage = ((totalSpent / budget) * 100).toFixed(2);
    const remainingPercentage = ((remaining / budget) * 100).toFixed(2);

    // Construct chart configuration
        var chartData = {
        type: 'doughnut',
        data: {
            labels: ['Spent', 'Remaining'],
            datasets: [{
            data: [totalSpent, remaining],
            backgroundColor: ['#86DAD5', '#EAF8F6']
            }]
        },
        options: {
            rotation: 185,
            cutout: '50%',
            plugins: {
            title: {
                display: true,
                text: 'Monthly Budget Usage'
            },
            legend: {
                position: 'bottom'
            },
            doughnutlabel: {
                labels: [
                {
                    text: `$${totalSpent.toFixed(2)}`,
                    font: {
                    size: 24,
                    weight: 'bold'
                    }
                },
                {
                    text: `/$${budget.toFixed(2)}`,
                    font: {
                    size: 18
                    }
                }
                ]
            }
            }
        },
        plugins: ['datalabels', 'doughnutlabel']
        };

        
    // Respond with chart details
    if (budget === 0) {
      chartData = {
        type: 'doughnut',
        data: {
            labels: ['Spent'],
            datasets: [{
            data: [totalSpent, totalSpent],
            backgroundColor: ['#86DAD5']
            }]
        },
        options: {
            rotation: 185,
            cutout: '50%',
            plugins: {
            title: {
                display: true,
                text: 'Monthly Budget Usage'
            },
            legend: {
                position: 'bottom'
            },
            doughnutlabel: {
                labels: [
                {
                    text: `$${totalSpent.toFixed(2)}`,
                    font: {
                    size: 24,
                    weight: 'bold'
                    }
                },
                {
                  text: 'No Budget Set',
                  font: {
                    size: 18
                  }
                }
                ]
            }
            }
        },
        plugins: ['datalabels', 'doughnutlabel']
        };
    }


        const chartUrl = 'https://quickchart.io/chart?c=' + encodeURIComponent(JSON.stringify(chartData));

    res.json({
      chartUrl,
      totalSpent: totalSpent.toFixed(2),
      remaining: remaining.toFixed(2),
      budget: budget.toFixed(2),
      spentPercentage,
      remainingPercentage
    });

  } catch (error) {
    console.error("Error generating budget doughnut chart:", error);
    res.status(500).json({ message: "Failed to generate budget chart" });
  }
}

async function addTransactionToAccount(req, res) {
    try {
        const accountId = req.params.id;
        const { amount, date, description, category } = req.body;

        if (!amount || !date || !description || !category) {
            return res.status(400).json({ message: "All fields are required." });
        }

        let transaction = {
            amount: parseFloat(amount),
            date: date,
            description: description.trim(),
            category: category.trim()
        };

        const result = await financeModel.addTransactionToAccount(accountId, transaction);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    getExpenditureGoalByID,
    getTotalExpenditureByID,
    getMonthlyExpenditureByID,
    getExpenditureByMonthBarChart,
    getAllTransactionsByID,
    getBudgetExpenditureDoughnutChart,
    addTransactionToAccount
};