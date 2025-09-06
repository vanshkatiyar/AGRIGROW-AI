const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:vansh.katiyar.786@gmail.com', // Replace with your email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const sendPushNotification = (subscription, payload) => {
  try {
    return webpush.sendNotification(JSON.parse(subscription), JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to send push notification", error);
  }
};

module.exports = { sendPushNotification };