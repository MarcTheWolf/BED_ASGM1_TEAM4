const accountSid = process.env.TWILIO_ACCOUNT_SID; // Use environment variable for security
const authToken = process.env.TWILIO_AUTH_TOKEN; // Use environment variable for security
const client = require('twilio')(accountSid, authToken);



client.messages
    .create({
        body: `Hi there, to sync your elderly account with your caretaker, input this code into the caretaker's input as shown 666666`,
        messagingServiceSid: 'MG726d75ee10f3e22688de1eb914da55ee',
        to: '+6588286909'
    })
    .then(message => console.log(message.sid));


async function sendTwilioMessage(phoneNumber, messageBody) {
    client.messages
    .create({
        body: messageBody,
        messagingServiceSid: 'MG726d75ee10f3e22688de1eb914da55ee',
        to: `+65${phoneNumber}`
    })
    .then(message => console.log(message.sid));
}

module.exports = {
    sendTwilioMessage
};