const pubnubService = require('../Services/liveChat');
const syncingModel = require('../Models/syncingModel');

function getChatChannel(acc1, acc2) {
  return `chat_${Math.min(acc1, acc2)}_${Math.max(acc1, acc2)}`;
}

exports.getSyncedAccounts = async (req, res) => {
  const accountId = req.user.id;
  try {
    const syncedAccounts = await syncingModel.getSyncedAccountsById(accountId);
    res.status(200).json(syncedAccounts);
  } catch (err) {
    console.error("❌ Failed to retrieve synced accounts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMessages = async (req, res) => {
  const from_id = req.user.id;
  const to_id = parseInt(req.params.with_id);

  const channel = getChatChannel(from_id, to_id);
  if (!channel) {
    return res.status(400).json({ message: "Invalid chat channel." });
  }

  pubnubService.subscribeToChat(channel);
  try {
    const messages = await pubnubService.fetchMessages(channel);
    res.status(200).json(messages);
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
    res.status(500).json({ message: "Failed to get messages." });
  }
};

exports.sendMessage = async (req, res) => {
  const { to_id, message } = req.body;
  const from_id = req.user.id;

  if (!message || !to_id) {
    return res.status(400).json({ message: "Missing message or recipient." });
  }

  const channel = getChatChannel(from_id, to_id);
  const payload = {
    from_id,
    to_id,
    message,
    timestamp: new Date().toISOString()
  };

  try {
    await pubnubService.publishMessage(channel, payload);
    res.status(200).json({ message: "Message sent." });
  } catch (err) {
    console.error("❌ PubNub error:", err);
    res.status(500).json({ message: "Failed to send message." });
  }
};