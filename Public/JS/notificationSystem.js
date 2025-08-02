(function () {
  let notiQueue = [];
  let isDisplaying = false;

  // Connect to socket.io
  const socket = io();

  function injectNotificationCSS() {
    if (document.getElementById('notification-css')) return;

    const style = document.createElement('style');
    style.id = 'notification-css';
    style.textContent = `
      .global-notification-bar {
        background-color: #004085;
        color: white;
        padding: 15px;
        font-size: 16px;
        text-align: center;
        position: fixed;
        top: 65px;
        left: 0;
        right: 0;
        z-index: 1000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: slideDown 0.5s ease-out;
      }

      @keyframes slideDown {
        from { transform: translateY(-100%); opacity: 0; }
        to   { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  function createNotificationBar(message) {
    const bar = document.createElement('div');
    bar.className = 'global-notification-bar';
    bar.innerText = message;
    document.body.prepend(bar);
    return bar;
  }

  async function displayNextNotification() {
    if (isDisplaying || notiQueue.length === 0) return;
    isDisplaying = true;

    const user = JSON.parse(localStorage.getItem('user'));
    const noti = notiQueue.shift();
    const bar = createNotificationBar(noti.description);

    try {
      await fetch(`/markNotificationAsNotified/${noti.noti_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + user.token
        }
      });
    } catch (err) {
      console.warn(`Failed to mark notification ${noti.noti_id} as notified`);
    }

    setTimeout(() => {
      bar.remove();
      isDisplaying = false;
      displayNextNotification();
    }, 5000);
  }

  // On receiving a new notification from the backend via socket
  socket.on('notification', (notification) => {
    notiQueue.push(notification);
    displayNextNotification();
  });

  // On DOM load: fetch all unnotified notifications
  document.addEventListener('DOMContentLoaded', async () => {
    injectNotificationCSS();

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.token) return;

    console.log("User ID for socket registration:", user?.id);
    socket.emit('register', user.id);

    try {
      const res = await fetch("/getUnnotified", {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + user.token
        }
      });

      if (res.ok) {
        const unnotified = await res.json();
        if (Array.isArray(unnotified)) {
          console.log("🔄 Loading unnotified notifications:", unnotified.length);
          notiQueue.push(...unnotified);
          displayNextNotification();
        }
      } else {
        console.warn("⚠️ Failed to load unnotified notifications");
      }
    } catch (err) {
      console.error("❌ Error fetching unnotified notifications:", err);
    }
  });
})();
