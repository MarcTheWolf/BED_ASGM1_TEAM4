(function () {
  let notiQueue = [];
  let isDisplaying = false;

  const socket = io();

  function injectNotificationCSS() {
    if (document.getElementById('notification-css')) return;

    const style = document.createElement('style');
    style.id = 'notification-css';
    style.textContent = `
      .global-notification-bar {
        background-color: #004085;
        color: white;
        padding: 30px 40px;
        font-size: 20px;
        text-align: center;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 4000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        border-radius: 12px;
        width: 80%;
        max-width: 500px;
        animation: fadeInCenter 0.4s ease-out;
      }

      @keyframes fadeInCenter {
        from { opacity: 0; transform: translate(-50%, -60%); }
        to   { opacity: 1; transform: translate(-50%, -50%); }
      }

      .popup-message {
        display: block;
        font-size: 22px;
        margin-bottom: 25px;
        line-height: 1.6;
      }

      .popup-ok-button {
        background-color: #e0f0ff;
        color: #004085;
        border: none;
        padding: 12px 24px;
        font-size: 18px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }

      .popup-ok-button:hover {
        background-color: #cce4fa;
      }
    `;
    document.head.appendChild(style);
  }

  async function createNotificationBar(message) {
    injectNotificationCSS();

    try {
      const res = await fetch('../notificationPopup.html');
      const html = await res.text();

      const temp = document.createElement('div');
      temp.innerHTML = html.trim();
      const popup = temp.querySelector('.global-notification-bar');

      popup.querySelector('.popup-message').textContent = message;
      popup.style.display = 'block';

      // Attach OK button behavior
      const okBtn = popup.querySelector('.popup-ok-button');
      okBtn.onclick = () => popup.remove();

      document.body.appendChild(popup);

      return popup;
    } catch (err) {
      console.error('Failed to load notification popup:', err);
    }
  }

  async function displayNextNotification() {
    if (isDisplaying || notiQueue.length === 0) return;
    isDisplaying = true;

    const user = JSON.parse(localStorage.getItem('user'));
    const noti = notiQueue.shift();
    const bar = await createNotificationBar(noti.description);

    try {
      await fetch(`/markNotificationAsNotified/${noti.noti_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + user.token
        }
      });
    } catch (err) {
      console.warn(`Failed to mark notification ${noti.noti_id} as notified`);
    }

    // Auto-hide after 10s
    setTimeout(() => {
      bar?.remove();
      isDisplaying = false;
      displayNextNotification();
    }, 10000);
  }

  socket.on('notification', (notification) => {
    notiQueue.push(notification);
    displayNextNotification();
  });

  socket.on('requestRegistration', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      socket.emit('register', user.id);
      console.log("🔐 Responded to registration request with user ID:", user.id);
    } else {
      console.warn("⚠️ No user ID found in localStorage for registration");
    }
  });

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

    // Add test button trigger
    const testBtn = document.getElementById('test-noti-btn');
    testBtn?.addEventListener('click', () => {
      window.showCustomNotification("🔔 This is a test notification!");
    });
  });

  window.showCustomNotification = async function(message) {
    const popup = await createNotificationBar(message);
    setTimeout(() => popup?.remove(), 5000);
  };
})();
