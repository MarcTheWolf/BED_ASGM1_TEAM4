const chatHistories = {}; // In-memory object: { userId: [messages] }
const chatprompt = "You are a helpful assistant for an elderly care app, SeniorSync. Always keep replies short and simple (20 words max). Only give information based on details given. Try not to redirect users to other resources unless absolutely necessary.";

function getHistory(userId) {
  if (!chatHistories[userId]) {
    chatHistories[userId] = [
      {
        role: "system",
        content: chatprompt,
      }
    ];
  }
  return chatHistories[userId];
}

function addMessage(userId, role, content) {
  const history = getHistory(userId);
  history.push({ role, content });

  // Keep only the last 20 messages
  if (history.length > 20) {
    chatHistories[userId] = history.slice(-20);
  }
}

function resetHistory(userId) {
  delete chatHistories[userId];
}

module.exports = {
  getHistory,
  addMessage,
  resetHistory
};