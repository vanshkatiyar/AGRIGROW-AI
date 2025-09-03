const webpush = require('web-push');

// You need to generate these VAPID keys once
// npx web-push generate-vapid-keys
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const sendPushNotification = (subscription, payload) => {
    return webpush.sendNotification(subscription, JSON.stringify(payload));
};

module.exports = { sendPushNotification };