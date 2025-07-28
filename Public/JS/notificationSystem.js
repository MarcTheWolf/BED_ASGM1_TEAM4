(function () {
  let notiQueue = [];
  let isDisplaying = false;

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

  async function fetchNewNotifications() {
    if (notiQueue.length > 0 || isDisplaying) return; // 💡 Only fetch if queue is empty and nothing is displaying

    const user = JSON.parse(localStorage.getItem('user'));
    try {
      const res = await fetch('/getUnnotified', {
        headers: {
          'Authorization': 'Bearer ' + user.token
        }
      });

      if (!res.ok) throw new Error('--');

      const notifications = await res.json();
      if (Array.isArray(notifications) && notifications.length > 0) {
        notiQueue.push(...notifications);
        displayNextNotification();
      }
    } catch (err) {
    }
  }

  async function displayNextNotification() {
    if (isDisplaying || notiQueue.length === 0) return;
    isDisplaying = true;

    const user = JSON.parse(localStorage.getItem('user'));
    const noti = notiQueue.shift();
    const bar = createNotificationBar(noti.description);

    try {
      const markRes = await fetch(`/markNotificationAsNotified/${noti.noti_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + user.token
        }
      });

      if (!markRes.ok) {
        console.warn(`Failed to mark noti ${noti.noti_id} as notified`);
      }
    } catch (err) {
      console.error(`[Mark Failed: noti_id ${noti.noti_id}]`, err);
    }

    setTimeout(() => {
      bar.remove();
      isDisplaying = false;
      displayNextNotification(); // Show next in queue
    }, 5000);
  }

  injectNotificationCSS();
  setInterval(fetchNewNotifications, 5000); // Poll every 5s only if queue is clear
})();
