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