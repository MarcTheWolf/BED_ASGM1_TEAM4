var Medication = []
var MedicalCondition = [];




document.addEventListener('DOMContentLoaded', async function() {
  await loadProfileInformation();
  await retrieveMedicationData();
  await retrieveMedicalConditionData();
  loadMedical();
  console.log(Medication);
  console.log(MedicalCondition);
});





const medicalBtn = document.getElementById('btn-medical');
const medicationBtn = document.getElementById('btn-medication');
const contentSection = document.getElementById('content-section');

async function retrieveMedicalConditionData() {
    try {
        // Simulate fetching data from a server
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await fetch(`/getMedicalConditionByAccountID`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            }
        });
        
        if (!response.ok) {
            autoLogout(response);
            console.error('Failed to retrieve data:', response.statusText);
        }
        
        MedicalCondition = await response.json();

    } catch (error) {
        console.error('Error retrieving data:', error);
    }
}

async function retrieveMedicationData() {
    try {
        // Simulate fetching data from a server
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await fetch(`/getMedicationByAccountID`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`
        }
        });
        
        if (!response.ok) {
            autoLogout(response);
            console.error('Failed to retrieve data:', response.statusText);
        }
        
        Medication = await response.json();

    } catch (error) {
        console.error('Error retrieving data:', error);
    }
}

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


  profileImg.src = user.pfp_link || 'https://via.placeholder.com/80';
  profileName.innerHTML = `${user.name}` || 'Unknown';
  profileEmail.innerHTML = `<strong>Email:</strong> ${user.email  || 'Unknown'}`;
  profileAddress.innerHTML =`<strong>Address:</strong> ${user.address  || 'Unknown'}`;
  profileGender.innerHTML = `<strong>Gender:</strong> ${genderMap[user.gender]  || 'Unknown'}`;
  profileDob.innerHTML = `<strong>Date of Birth:</strong> ${formatDate(user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Unknown')}`;
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

function loadMedical() {
  contentSection.innerHTML = '';
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.textContent = 'Add Medical Condition';
  addBtn.onclick = () => openPopup('medical-popup'); // Attach openPopup
  contentSection.appendChild(addBtn);

  MedicalCondition.forEach(item => {
  const card = document.createElement('div');
  card.className = 'card card-flex card-content';
  card.setAttribute('data-id', item.medc_id);
  card.setAttribute('data-medType', 'medicalCondition');

  let modified = item.updated_at
    ? `<div class="card-info"><strong>${item.name}</strong><br>Last modified: ${formatDate(item.updated_at)}</div>`
    : `<div class="card-info"><strong>${item.name}</strong><br>Created on: ${formatDate(item.created_at)}</div>`;

  card.innerHTML = `
    ${modified}
    <div class="card-actions">
      <button class="card-btn update-btn" data-id="${item.medc_id}" data-medType = "Medical Condition">Update</button>
      <button class="card-btn delete-btn" data-id="${item.medc_id}" data-medType = "Medical Condition">Delete</button>
    </div>
  `;

  contentSection.appendChild(card);
});
}

function loadMedication() {
  contentSection.innerHTML = '';
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.textContent = 'Add Medication';
  addBtn.onclick = () => openPopup('medication-popup'); // Attach openPopup
  contentSection.appendChild(addBtn);

    function getFrequencyLabel(code) {
      switch (code) {
        case 'D': return 'daily';
        case 'W': return 'weekly';
        case 'M': return 'monthly';
        case 'WR': return 'as needed';
        default: return 'on an unknown schedule';
      }
    }

  Medication.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card card-flex'; // Add new layout class
    card.setAttribute('data-id', item.med_id);
    card.setAttribute('data-medType', 'medication')
    card.innerHTML = `

      <div class="card-content">
        <strong>${item.name}</strong><br>
        Dosage: ${item.dosage}<br>
        Take ${item.dosage} ${getFrequencyLabel(item.frequency)}
      </div>
      <div class="card-actions">
        <button class="card-btn update-btn" data-id="${item.med_id}" data-medType = "Medication">Update</button>
        <button class="card-btn delete-btn" data-id="${item.med_id}" data-medType = "Medication">Delete</button>
      </div>

    `;
    contentSection.appendChild(card);
  });
}


medicalBtn.addEventListener('click', () => {
  medicalBtn.classList.add('active');
  medicationBtn.classList.remove('active');
  loadMedical();
});

medicationBtn.addEventListener('click', () => {
  medicationBtn.classList.add('active');
  medicalBtn.classList.remove('active');
  loadMedication();
});



const logoutButton = document.querySelector('.logout-btn');
logoutButton.addEventListener('click', loggout);

function loggout() {
        alert("You have been logged out.");
        localStorage.removeItem('user');
        window.location.href = "login.html";
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

function openPopup(id) {
  document.getElementById(id).style.display = "block";
}

function closePopup(id) {
  document.getElementById(id).style.display = "none";
}




const medicalForm = document.getElementById('medical-form');

medicalForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent page reload

  var user = JSON.parse(localStorage.getItem("user"))
  const formData = new FormData(medicalForm);
  const payload = {
    name: formData.get('name'),
    descr: formData.get('descr'),
    prescription_date: formData.get('prescription_date'),
    acc_id: user.id,
    mod_id: user.id
  };

  try {
    const response = await fetch(`/createMedicalCondition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert('Medical condition added successfully!');
      closePopup('medical-popup');
      medicalForm.reset();
      await retrieveMedicalConditionData();
      loadMedical(); 
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || 'Failed to submit medical condition'}`);
    }
  } catch (err) {
    console.error(err);
    alert('Network or server error');
  }
});
const medicationForm = document.getElementById('medication-form');

medicationForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent default form submission

  var user = JSON.parse(localStorage.getItem("user"));
  const formData = new FormData(medicationForm);
  
  const payload = {
    name: formData.get('name'),
    description: formData.get('description'),
    dosage: formData.get('dosage'),
    time: formData.get('time'),
    frequency: formData.get('frequency'),
    start_date: formData.get('start_date'),
    account_id: user.id
  };

  try {
    const response = await fetch(`/createMedication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert('Medication added successfully!');
      closePopup('medication-popup');
      medicationForm.reset();
      await retrieveMedicationData();
      loadMedication(); 
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || 'Failed to submit medication'}`);
    }
  } catch (err) {
    console.error(err);
    alert('Network or server error');
  }
});


let deleteId = null;
let medType = null;


document.addEventListener('click', async function (event) {
  // Check if a delete button was clicked
  const user = JSON.parse(localStorage.getItem("user"));
  if (event.target.classList.contains('delete-btn')) {
    deleteId = event.target.getAttribute('data-id');
    medType = event.target.getAttribute('data-medType');

    console.log(`Delete ID: ${deleteId}, Type: ${medType}`);

      document.getElementById('delete-message').textContent = 
    `Are you sure you want to delete your ${medType} record?`;
    openPopup('delete-confirmation-popup');
  }

  // Confirm delete
  if (event.target.id === 'confirm-delete-btn' && deleteId !== null) {
    if (medType == "Medical Condition") {
        url = `/deleteMedicalCondition/${deleteId}`;
      } else if (medType == "Medication") {
        url = `/deleteMedication/${deleteId}`;
      } else {
        alert('Unknown record type.');
        return;
      }
    fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    .then(async response => {
      if (response.ok) {
        alert("Record deleted successfully.");
        closePopup('delete-confirmation-popup');
        deleteId = null;

        await retrieveMedicalConditionData();
        await retrieveMedicationData();

        if (medType == "Medical Condition") {
          loadMedical(); 
        } else if (medType == "Medication") {
          loadMedication();
        } else {
          alert('Unknown record type.');
          return;
        }
        
      } else {
        return response.json().then(data => {
          throw new Error(data.message || 'Delete failed.');
        });
      }
    })
    .catch(error => {
      console.error(error);
      alert("Failed to delete record.");
      closePopup('delete-confirmation-popup');
    });
  }
});