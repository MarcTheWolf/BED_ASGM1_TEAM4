document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('announcementModal');
  const openBtn = document.getElementById('openModalBtn30Jul');
  const closeBtn = modal.querySelector('.close');

  openBtn.addEventListener('click', function (e) {
    e.preventDefault();
    modal.style.display = 'block';
  });

  closeBtn.addEventListener('click', function () {
    modal.style.display = 'none';
  });

  window.addEventListener('click', function (e) {
    if (e.target == modal) {
      modal.style.display = 'none';
    }
  });
});

document.addEventListener('DOMContentLoaded', async function () {
  const container = document.querySelector('main.notification-page');
  const user = JSON.parse(localStorage.getItem('user'));

  try {
    const res = await fetch('/getAllNotifications', {
      headers: {
        'Authorization': `Bearer ${user?.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) throw new Error('Failed to fetch notifications');
    const notifications = await res.json(); // assuming it's an array

    // Group notifications by date
    const grouped = {};

    notifications.forEach(noti => {
      const date = new Date(noti.time).toLocaleDateString('en-SG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }); // e.g. "03 Aug 2025"

      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(noti);
    });

    // Clear static notifications
    container.innerHTML = `
      <section class="notification-header">
        <h1>Notifications</h1>
        <p>All your notifications here in this mailbox, never miss an opportunity to forget things.</p>
      </section>
    `;

    // Render grouped notifications
    for (const [date, items] of Object.entries(grouped)) {
      const groupSection = document.createElement('section');
      groupSection.className = 'notification-group';
      groupSection.innerHTML = `<h2>${date}</h2>`;

      items.forEach(noti => {
        const timeStr = new Date(noti.time).toLocaleTimeString('en-SG', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const card = document.createElement('div');
        card.className = 'notification-card';
        card.innerHTML = `
          <div class="time-label">${timeStr}</div>
          <span class="badge ${noti.type.toLowerCase()}">${noti.type.toUpperCase()}</span>
          <p>${noti.description}</p>
          <a href="#" class="view-more">&gt;</a>
        `;
        groupSection.appendChild(card);
      });

      container.appendChild(groupSection);
    }

    container.innerHTML += `<p class="footer-note">You have caught up all your notifications, have a nice day!</p>`;

  } catch (error) {
    console.error('Failed to load notifications:', error);
    container.innerHTML = `<p class="footer-note">Unable to load notifications.</p>`;
  }

  // Setup modal handler (optional enhancement)
  const modal = document.getElementById('announcementModal');
  const closeBtn = modal?.querySelector('.close');

  if (modal && closeBtn) {
    document.body.addEventListener('click', function (e) {
      if (e.target.classList.contains('view-more') && e.target.closest('.badge.announcement')) {
        e.preventDefault();
        modal.style.display = 'block';
      }

      if (e.target === modal || e.target === closeBtn) {
        modal.style.display = 'none';
      }
    });
  }
});
