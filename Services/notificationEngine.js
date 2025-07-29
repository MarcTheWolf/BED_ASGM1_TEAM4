const sql = require("mssql");
const dbConfig = require("../dbConfig");

const account = require("../Models/accountModel.js");
const medicalInformation = require("../Models/medicalInformationModel.js");
const event = require("../Models/eventModel.js");
const finance = require("../Models/financeModel.js");
const task = require("../Models/taskModel.js");
const notifications = require("../Models/notificationsModel.js");

async function run() {
    //console.log("Scheduling notifications...");
    try {
        await scheduleEventNotifications();
        await scheduleFinanceNotifications();
        await scheduleMedicationNotifications();
        await scheduleTaskNotifications();
    } catch (error) {
    //console.error("Error scheduling notifications:", error);
    }
    //console.log("Notifications scheduled successfully.");
}


async function scheduleMedicationNotifications() {

}


async function scheduleFinanceNotifications() {
    try {
    const users = await finance.getAllUserBudget();

    for (const user of users) {
      const { id, monthly_goal } = user;
      if (!monthly_goal) continue;
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const expenditure = await finance.getExpenditureForMonth(id, monthStr);

      const usageRatio = expenditure.total / monthly_goal;

      const alreadyNotified = await notifications.hasSentBudgetNotificationThisMonth(id);

      if (usageRatio >= 0.8 && !alreadyNotified) {
        const percentage = Math.round(usageRatio * 100);
        const message = `You've used ${percentage}% of your monthly budget. Monitor your spending!`;

        const payload = {
            type: 'finance',
            acc_id: id,
            description: message,
            time: new Date(),
        }


        await notifications.createNotification(payload);
        console.log(`[Finance]: Notification Scheduled for account ${id}`);
      }
    }

  } catch (err) {
    console.error("Finance Notification Engine Error:", err);
  }
}

async function scheduleEventNotifications() {

}


async function scheduleTaskNotifications() {
}



module.exports = {
    run
};
