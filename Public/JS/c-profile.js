var Medication = []
var MedicalCondition = [];

const editProfileBtn = document.querySelector('.edit-btn');
editProfileBtn.addEventListener('click', () => {
  window.location.href = "e-editProfile.html";
});


document.addEventListener('DOMContentLoaded', async function() {
  await loadProfileInformation();
  await reloadProfileData();
  await loadElderlyList();
});

async function loadProfileInformation() {
  const user = JSON.parse(localStorage.getItem("user"));
  const profileImg = document.querySelector('.avatar');
  const profileName = document.querySelector('#display-name');
  const profileEmail = document.querySelector('#display-email');
  const profileDob = document.querySelector('#display-dob');
  const profilePhone = document.querySelector('#display-phone');
  const profileAddress = document.querySelector('#display-address');
  const profileGender = document.querySelector('#display-gender');
  const profileLanguage = document.querySelector('#display-language');

  

  const genderMap = {
  'M': 'Male',
  'F': 'Female',
  'O': 'Other'
  };
  const dob = user.date_of_birth
    ? new Date(user.date_of_birth).toLocaleDateString('en-SG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  profileDob.innerHTML = `<strong>Date of Birth:</strong> ${dob}`;

  profileImg.src = user.pfp_link || 'https://via.placeholder.com/80';
  profileName.innerHTML = `${user.name}` || 'Unknown';
  profileEmail.innerHTML = `<strong>Email:</strong> ${user.email  || 'Unknown'}`;
  profileAddress.innerHTML =`<strong>Address:</strong> ${user.address  || 'Unknown'}`;
  profileGender.innerHTML = `<strong>Gender:</strong> ${genderMap[user.gender]  || 'Unknown'}`;
  profileAddress.innerHTML = `<strong>Address:</strong> ${user.address  || 'Unknown'}`;
  profileLanguage.innerHTML = `<strong>Prefered Language:</strong> ${user.preferred_language  || 'Unknown'}`;

  try {
    const response = await fetch(`/getPhoneByAccountID`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch phone number.');

    const data = await response.json();
    console.log('Phone number loaded:', data.phone_number);

    profilePhone.innerHTML = `<strong>Phone:</strong> ${data.phone_number || 'Unknown'}`;
  } catch (error) {
    console.error('Error loading phone number:', error);
    profilePhone.innerHTML = `<strong>Phone:</strong> Unknown`;
  }
}


function autoLogout(response) {
if (response.status = 403) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("user");
        window.location.href = "login.html";
        return;
    }
}



async function reloadProfileData() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user.token;

  const req = await fetch("/getAccountById", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    }
  });


  if (req.ok) {
    const newProfile = await req.json();
    newProfile.token = token;
    localStorage.setItem("user", JSON.stringify(newProfile));
    console.log("Profile reloaded successfully:", newProfile);
  } else {
    console.warn("Failed to reload profile:", await req.text());
  }
}


const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


async function loadElderlyList() {
  const user = JSON.parse(localStorage.getItem("user"));
  const elderlyListContainer = document.querySelector(".caretaker-list");

  try {
    const response = await fetch(`/getSyncedAccounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch elderly list.');
    const elderlyList = await response.json();
    console.log('Elderly list loaded:', elderlyList);

    elderlyListContainer.innerHTML = ''; // Clear old entries

    elderlyList.forEach(elderly => {
      const item = document.createElement('div');
      item.classList.add('caretaker-item');

      item.innerHTML = `
        <img src="${elderly.pfp_link || 'https://via.placeholder.com/50'}" class="avatar" alt="${elderly.name}">
        <div>
          <p><strong>${elderly.name}</strong></p>
          <p>${elderly.email}</p>
        </div>
        <button class="view-btn">View Profile</button>
      `;

      elderlyListContainer.appendChild(item);
    });

  } catch (error) {
    console.error('Error loading elderly list:', error);
  }
}


const logoutButton = document.querySelector('.logout-btn');
logoutButton.addEventListener('click', loggout);

function loggout() {
        alert("You have been logged out.");
        localStorage.removeItem('user');
        window.location.href = "login.html";
}















