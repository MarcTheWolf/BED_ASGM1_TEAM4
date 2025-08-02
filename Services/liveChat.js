const PubNub = require('pubnub');
const { getIO, chatRefresh } = require('../Services/notificationEngine');
socketIO = getIO();

const pubnub = new PubNub({
  publishKey: process.env.PUBNUB_PUBLISH_KEY,
  subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
  uuid: 'backend-server'
});

pubnub.addListener({
  status: function(statusEvent) {
    if (statusEvent.category === "PNConnectedCategory") {
      console.log(`✅ Successfully subscribed to: ${statusEvent.affectedChannels.join(", ")}`);
    } else {
      console.warn(`⚠️ PubNub status: ${statusEvent.category}`, statusEvent);
    }
  },
  message: async function (msg) {
    const payload = msg.message;
    await chatRefresh(payload.to_id, payload);
    console.log(`🔁 Relayed message to user_${payload.to_id}`);
  }
});

function subscribeToChat(channel) {
  pubnub.subscribe({
    channels: [channel],
    withPresence: false,
    // 👇 THIS LINE IS CRITICAL IF SAME UUID PUBLISHES & SUBSCRIBES
    sendOwnEvents: true
  });
  console.log(`🔔 Subscribed to channel: ${channel}`);
}


async function publishMessage(channel, payload) {
  await subscribeToChat(channel); // 👈 subscribe BEFORE publishing
  console.log(`📤 Publishing to channel: ${channel}`, payload);

  return new Promise((resolve, reject) => {
    pubnub.publish({ channel, message: payload }, (status, response) => {
      if (status.error) {
        console.error("❌ PubNub publish error:", status);
        return reject(status);
      }
      console.log("✅ Message published:", response);
      resolve(response);
    });
  });
}

function fetchMessages(channel) {
  return new Promise((resolve, reject) => {
    if (!channel) return reject({ message: "Missing channel" });

    pubnub.history({ channel, count: 50 }, (status, response) => {
      if (status.error) {
        reject(status);
      } else {
        resolve(response.messages.map(m => m.entry));
      }
    });
  });
}

module.exports = { publishMessage, fetchMessages, subscribeToChat };