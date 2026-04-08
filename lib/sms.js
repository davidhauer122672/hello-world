const twilio = require('twilio');

let client = null;

function getClient() {
  if (client) return client;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    console.warn('Twilio: TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set, SMS disabled');
    return null;
  }

  client = twilio(sid, token);
  return client;
}

async function sendSMS(body) {
  const twilioClient = getClient();
  if (!twilioClient) return;

  const from = process.env.TWILIO_PHONE_NUMBER;
  const to = process.env.OWNER_PHONE_NUMBER;

  if (!from || !to) {
    console.warn('Twilio: TWILIO_PHONE_NUMBER or OWNER_PHONE_NUMBER not set');
    return;
  }

  try {
    const message = await twilioClient.messages.create({ body, from, to });
    console.log(`SMS sent: ${message.sid}`);
  } catch (err) {
    console.error('SMS send failed:', err.message);
  }
}

module.exports = { sendSMS };
