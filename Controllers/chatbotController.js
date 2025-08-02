const financeModel = require("../Models/financeModel.js");
const eventModel = require("../Models/eventModel.js");
const medicalModel = require("../Models/medicalInformationModel.js");
const taskModel = require("../Models/taskModel.js");
const accountModel = require("../Models/accountModel.js");

const chatMemory = require("../Services/chatbotHistory.js");



const chatbotModel = require("../Models/chatbotModel.js");



async function getChatbotResponse(req, res) {
  const userMessage = req.body.message;

  try {
    const accountId = req.user.id;

    // Step 1: Get chat history
    const chatHistory = chatMemory.getHistory(accountId);

    const now = new Date();
    const yearMonth = now.toLocaleDateString('sv-SE').slice(0, 7); // "yyyy-mm"

    // Step 2: If this is the user's first message, insert a data summary
    if (chatHistory.length === 1) {
      let accountDetails = {};
      let eventDetails = [];
      let medicationDetails = [];
      let medicalDetails = [];
      let expenditureDetails = [];
      let taskDetails = [];

      try {
        // Fetch each independently to reduce pressure on connection pool
        accountDetails = await accountModel.getAccountById(accountId);
      } catch (e) {
        console.warn("Failed to fetch accountDetails:", e.message);
      }

      try {
        eventDetails = await eventModel.getEventRegisteredByID(accountId);
      } catch (e) {
        console.warn("Failed to fetch eventDetails:", e.message);
      }

      try {
        taskDetails = await taskModel.getTasks();
      } catch (e) {
        console.warn("Failed to fetch taskDetails:", e.message);
      }

      try {
        medicationDetails = await medicalModel.getMedicationByAccountID(accountId);
      } catch (e) {
        console.warn("Failed to fetch medicationDetails:", e.message);
      }

      try {
        medicalDetails = await medicalModel.getMedicalConditionByAccountID(accountId);
      } catch (e) {
        console.warn("Failed to fetch medicalDetails:", e.message);
      }

      try {
        expenditureDetails = await financeModel.getExpenditureForMonth(accountId, yearMonth);
      } catch (e) {
        console.warn("Failed to fetch expenditureDetails:", e.message);
      }

      const userContext = `
User Data:
- Account: ${JSON.stringify(accountDetails, null, 2)}
- Registered Events: ${JSON.stringify(eventDetails, null, 2)}
- Medications: ${JSON.stringify(medicationDetails, null, 2)}
- Medical Conditions: ${JSON.stringify(medicalDetails, null, 2)}
- Monthly Expenditure: ${JSON.stringify(expenditureDetails, null, 2)}
- Tasks: ${JSON.stringify(taskDetails, null, 2)}
      `.trim();

      chatMemory.addMessage(accountId, "system", userContext);
    }

    // Step 3: Add user's message to history
    chatMemory.addMessage(accountId, "user", userMessage);

    // Step 4: Send history to OpenAI
    const response = await chatbotModel.getChatbotResponse(chatMemory.getHistory(accountId));

    // Step 5: Save assistant reply to history
    chatMemory.addMessage(accountId, "assistant", response);

    res.json({ response });

  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}



async function clearChatHistory(req, res) {
  const accountId = req.user.id;

  try {
    chatMemory.resetHistory(accountId);
    res.status(200).json({ message: "Chat history cleared successfully." });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}   


module.exports = {
  getChatbotResponse,
  clearChatHistory
};