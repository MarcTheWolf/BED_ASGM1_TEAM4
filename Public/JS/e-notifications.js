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
  const user = JSON.parse(localStorage.getItem('user'));
  const container = document.querySelector('main.notification-page');
  const updatesCard = document.querySelector('.updates-card');

  try {
    const res = await fetch('/getAllNotifications', {
      headers: {
        'Authorization': `Bearer ${user?.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) throw new Error('Failed to fetch notifications');
    const notifications = await res.json(); // Assuming [{ time, type, description, ... }]

    const grouped = {};

    notifications.forEach(noti => {
      // Process updates into update section
      if (['event', 'event updated', 'event deleted'].includes(noti.type)) {
        const typeLabel = {
          event: "New Event",
          "event updated": "Event Updated",
          "event deleted": "Event Cancelled"
        }[noti.type];

        const updateDiv = document.createElement('div');
        updateDiv.classList.add('update-item');
        updateDiv.innerHTML = `
          📢 ${typeLabel}: <strong>${noti.description}</strong><br />
          <span class="update-sub">${new Date(noti.time).toLocaleString('en-SG')}</span>
          <span class="update-arrow">&gt;</span>
        `;
        updatesCard.appendChild(updateDiv);
        updatesCard.appendChild(document.createElement('hr'));
        return; // skip adding to normal group
      }

      // Otherwise, group for normal display
      const date = new Date(noti.time).toLocaleDateString('en-SG', {
        day: '2-digit', month: 'short', year: 'numeric'
      });

      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(noti);
    });

    // Clear and re-render notification content
    container.querySelectorAll('.notification-group, .footer-note').forEach(el => el.remove());

    for (const [date, items] of Object.entries(grouped)) {
      const groupSection = document.createElement('section');
      groupSection.className = 'notification-group';
      groupSection.innerHTML = `<h2>${date}</h2>`;

      items.forEach(noti => {
        const timeStr = new Date(noti.time).toLocaleTimeString('en-SG', {
          hour: '2-digit', minute: '2-digit', hour12: true
        });

        const card = document.createElement('div');
        console.log(noti.type);
        card.className = 'notification-card';
        card.innerHTML = `
          <div class="time-label">${timeStr}</div>
          <span class="badge ${noti.type.toLowerCase()}">${noti.type.toUpperCase()}</span>
          <p>${noti.description}</p>
          <a href="#" class="view-more"${noti.type === 'announcement' ? ' id="openModalBtn30Jul"' : ''}>&gt;</a>
        `;
        groupSection.appendChild(card);
      });

      container.appendChild(groupSection);
    }

    container.innerHTML += `<p class="footer-note">You have caught up all your notifications, have a nice day!</p>`;

  } catch (error) {
    console.error('Failed to load notifications:', error);
    container.innerHTML += `<p class="footer-note">Unable to load notifications.</p>`;
  }

  // Announcement modal logic
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

    const clearBtn = document.querySelector('.clear-notifications-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      const confirmClear = confirm("Are you sure you want to clear all notifications?");
      if (!confirmClear) return;

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const res = await fetch('/clearNotifications', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error('Failed to clear notifications');
        
        // Optional: Success feedback
        alert("All notifications cleared!");

        // Reload notifications from server
        location.reload();
      } catch (error) {
        console.error('Error clearing notifications:', error);
        alert("Failed to clear notifications.");
      }
    });
  }
});



