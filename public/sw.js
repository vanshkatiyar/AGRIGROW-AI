// This file handles push notifications when the app is in the background

self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/AgriGro-Logo.png', // Your app's logo
    badge: '/AgriGro-Logo.png', // A smaller icon for notifications
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});