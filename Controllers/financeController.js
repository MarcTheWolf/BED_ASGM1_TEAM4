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

async function getExpenditureByMonthBarChart(req, res) {
  try {
    const userId = req.params.id;
    const data = await accountModel.getMonthlyExpenditureByID(userId);

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

    // Option 1: Send chart URL
    res.json({ chartUrl });

    // Option 2 (Alternative): Direct image redirect
    // res.redirect(chartUrl);

  } catch (error) {
    console.error("Error generating chart:", error);
    res.status(500).json({ message: "Failed to generate chart" });
  }
}

module.exports = {
    getExpenditureGoalByID,
    getTotalExpenditureByID,
    getMonthlyExpenditureByID,
    getExpenditureByMonthBarChart
};