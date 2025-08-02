var Medication = []
var MedicalCondition = [];

const editProfileBtn = document.querySelector('.edit-btn');
editProfileBtn.addEventListener('click', () => {
  window.location.href = "e-editProfile.html";
});


document.addEventListener('DOMContentLoaded', async function() {
  await reloadProfileData();
  await loadProfileInformation();
  await retrieveMedicationData();
  await retrieveMedicalConditionData();
  loadMedical();
  console.log(Medication);
  console.log(MedicalCondition);
});

document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".medc-autocomplete");

  inputs.forEach(input => {
    input.addEventListener("input", async () => {
      const query = input.value.trim();
      const suggestionsList = input.parentElement.querySelector("ul");

      if (query.length < 2) {
        suggestionsList.innerHTML = "";
        return;
      }

      try {
        const res = await fetch(`/autocompleteMedicalCondition/${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Failed to fetch suggestions");

        const data = await res.json();
        const suggestions = data.suggestions || [];

        suggestionsList.innerHTML = "";
        suggestions.forEach(item => {
          const li = document.createElement("li");
          li.textContent = item;
          li.style.cursor = "pointer";
          li.addEventListener("click", () => {
            input.value = item;
            suggestionsList.innerHTML = "";
          });
          suggestionsList.appendChild(li);
        });
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const medInputs = document.querySelectorAll(".med-autocomplete");

  medInputs.forEach(input => {
    input.addEventListener("input", async () => {
      const query = input.value.trim();
      const suggestionsList = input.parentElement.querySelector(".med-suggestions");

      if (query.length < 2) {
        suggestionsList.innerHTML = "";
        return;
      }

      try {
        const res = await fetch(`/autocompleteMedication/${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Failed to fetch medication suggestions");

        const data = await res.json();
        const suggestions = data.suggestions || [];

        suggestionsList.innerHTML = "";
        suggestions.forEach(item => {
          const li = document.createElement("li");
          li.textContent = item;
          li.style.cursor = "pointer";
          li.addEventListener("click", () => {
            input.value = item;
            suggestionsList.innerHTML = "";
          });
          suggestionsList.appendChild(li);
        });
      } catch (err) {
        console.error("Medication autocomplete error:", err);
      }
    });
  });
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
              autoLogout(response);
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
      autoLogout(response);
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
  card.setAttribute('data-medType', 'mc');

  let modified = item.updated_at
    ? `<div class="card-info"><strong>${item.name}</strong><br>Last modified: ${formatDate(item.updated_at)}</div>`
    : `<div class="card-info"><strong>${item.name}</strong><br>Created on: ${formatDate(item.created_at)}</div>`;

  card.innerHTML = `
    ${modified}
    <div class="card-actions">
      <button class="card-btn update-btn" data-id="${item.medc_id}" data-medType = "mc">Update</button>
      <button class="card-btn delete-btn" data-id="${item.medc_id}" data-medType = "mc">Delete</button>
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
    card.setAttribute('data-medType', 'm')
    card.innerHTML = `

      <div class="card-content">
        <strong>${item.name}</strong><br>
        Take ${item.dosage} ${getFrequencyLabel(item.frequency)}<br>
        ${item.description ? `<em>${item.description}</em><br>` : ''}
      </div>
      <div class="card-actions">
        <button class="card-btn update-btn" data-id="${item.med_id}" data-medType = "m">Update</button>
        <button class="card-btn delete-btn" data-id="${item.med_id}" data-medType = "m">Delete</button>
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
    descr: formData.get('descr') || ' ',
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
      autoLogout(response);
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
    if (medType == 'mc') {
        url = `/deleteMedicalCondition/${deleteId}`;
      } else if (medType == 'm') {
        url = `/deleteMedication/${deleteId}`;
      } else {
        alert('Unknown record type.' + medType);
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

        if (medType == 'mc') {
          loadMedical(); 
        } else if (medType == 'm') {
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

  // Fetch and log full record when a card is clicked (not button)
  if (event.target.closest('.card') && !event.target.classList.contains('card-btn')) {
    const card = event.target.closest('.card');
    const recordId = card.getAttribute('data-id');
    const medType = card.getAttribute('data-medType');
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      let response;

      if (medType == 'm') {
        response = await fetch(`/getMedicationByID/${recordId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
      } else if (medType == 'mc') {
        response = await fetch(`/getMedicalConditionByID/${recordId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
      } else {
        console.warn("Unknown type:", medType);
        return;
      }

      if (!response.ok) {
        console.error(`Failed to fetch ${medType}:`, await response.text());
        return;
      }

      const data = await response.json();
      if (medType == 'm') {
        showMedicalData(data);
      } else if (medType == 'mc') {
        showMedicalConditionData(data);
      }
      console.log(`[${medType}]`, data);
    } catch (err) {
      console.error("Error fetching record:", err);
    }
  }
});

function getFrequencyLabel(code) {
  switch (code) {
    case 'D': return 'Daily';
    case 'W': return 'Weekly';
    case 'M': return 'Monthly';
    case 'WR': return 'When Required';
    default: return 'Unknown';
  }
}

async function showMedicalData(data) {
  console.log('Showing medical data:', data);
  document.getElementById('view-med-name').textContent = data.name;
  document.getElementById('view-med-desc').textContent = data.description || '—';
  document.getElementById('view-med-dosage').textContent = data.dosage;
  document.getElementById('view-med-time').textContent = data.time
    ? data.time.substring(11, 16)
    : '—';
  document.getElementById('view-med-frequency').textContent = getFrequencyLabel(data.frequency);
  document.getElementById('view-med-start-date').textContent = data.start_date.split('T')[0];

    const weeklyList = document.getElementById('view-weekly-timings-list');
    const weeklyContainer = document.getElementById('weekly-timings-container');

    weeklyList.innerHTML = ''; // clear old data
    weeklyContainer.classList.add('hidden'); // reset visibility before logic

  if (data.frequency === 'W') {
    try {
      const response = await fetch(`/getWeeklyTiming/${data.med_id}`, {
        headers: {
          Authorization: 'Bearer ' + (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : '')
        }
      });

      if (!response.ok) throw new Error('Failed to fetch weekly timings');

      const weeklyTimings = await response.json();
      console.log('Weekly timings:', weeklyTimings);

      if (weeklyTimings.length === 0) {
        const noTiming = document.createElement('div');
        noTiming.textContent = '—';
        noTiming.className = 'timing-record';
        weeklyList.appendChild(noTiming);
      } else {
        weeklyTimings.forEach(entry => {
          console.log('Weekly entry:', entry);
          const record = document.createElement('div');
          record.className = 'timing-record';

          const textSpan = document.createElement('span');
          const day = entry.day;
          const time = entry.time ? entry.time.substring(11, 16) : '—';
          textSpan.textContent = `${getDayfromNumber(day)} at ${time}`;

          record.appendChild(textSpan);
          weeklyList.appendChild(record);
          console.log(weeklyList);
        });
      }

      weeklyContainer.classList.remove('hidden');
    } catch (err) {
      console.error('Error fetching weekly timings:', err);
      const errorMsg = document.createElement('div');
      errorMsg.textContent = 'Error loading weekly timings';
      errorMsg.className = 'timing-record';
      weeklyList.appendChild(errorMsg);
      weeklyContainer.classList.remove('hidden');
    }
  }

  document.getElementById('view-medication-card').classList.remove('hidden');
}

function showMedicalConditionData(data) {
    // Fill in the medical condition view popup
  document.getElementById('view-medc-name').textContent = data.name;
  document.getElementById('view-medc-desc').textContent = data.descr || '—';
  document.getElementById('view-medc-date').textContent = data.prescription_date.split('T')[0];

  document.getElementById('view-medical-card').classList.remove('hidden');
}


function getDayfromNumber(dayNumber) {
  const dayMap = {
    7: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
  };
  return dayMap[dayNumber] || 'Unknown';
}


function closeCard(cardId) {
  document.getElementById(cardId).classList.add('hidden');
}


//Display and load information when update button is clicked
document.addEventListener('click', async function(event) {
  // Check if the "Update" button for a medication card is clicked
if (event.target.classList.contains('update-btn') && event.target.getAttribute('data-medType') === 'm') {
  const medicationId = event.target.getAttribute('data-id');
  console.log(`Update Medication ID: ${medicationId}`);

  try {
    // Fetch the data for the medication with the given ID
    const response = await fetch(`/getMedicationByID/${medicationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem("user")).token}`
      }
    });

          autoLogout(response);
    // Check if the response is not OK
    if (!response.ok) {
      throw new Error('Failed to fetch medication data');
    }

    // Parse the response as JSON
    const medication = await response.json();

if (medication) {
  // Populate the form with the medication data for editing
  document.getElementById('edit-med-name').value = medication.name;
  document.getElementById('edit-med-desc').value = medication.description || '';
  document.getElementById('edit-med-dosage').value = medication.dosage;
  document.getElementById('edit-med-frequency').value = medication.frequency;
  document.getElementById('edit-med-start-date').value = medication.start_date.split('T')[0];
  document.getElementById('edit-med-id').value = medication.med_id;

  if (medication.time) {
    const formattedTime = medication.time
      ? medication.time.substring(11, 16)
      : '—';
    document.getElementById('edit-med-time').value = formattedTime;
  } else {
    document.getElementById('edit-med-time').value = '';
  }

  // Weekly frequency: show + load editor
  const editorContainer = document.getElementById('edit-weekly-timings-editor');
  if (medication.frequency === 'W') {
    editorContainer.classList.remove('hidden');
    await loadWeeklyTimings(medication.med_id);
  } else {
    editorContainer.classList.add('hidden');
  }

  console.log(`Editing Medication: ${medication.name}`);

  // Show the popup for updating medication
  openPopup('edit-medication-popup');
}
  } catch (error) {
    console.error('Error fetching medication data:', error);
  }
}

  // Check if the "Update" button for a medical condition card is clicked
  if (event.target.classList.contains('update-btn') && event.target.getAttribute('data-medType') === 'mc') {
    const medicalConditionId = event.target.getAttribute('data-id');
    console.log(`Update Medical Condition ID: ${medicalConditionId}`);
    
    // Fetch the data for the medical condition with the given ID
    const response = await fetch(`/getMedicalConditionByID/${medicalConditionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem("user")).token}`
      }
    })

          autoLogout(response);
    
    if (!response.ok) {
      throw new Error('Failed to fetch condition data');
    }

    const condition = await response.json();
    
    console.log(`Editing Medical Condition ID: ${condition}`);
    if (condition) {
      // Populate the form with the medical condition data for editing
      document.getElementById('edit-medc-name').value = condition.name;
      document.getElementById('edit-medc-descr').value = condition.descr || '';
      document.getElementById('edit-medc-date').value = condition.prescription_date.split('T')[0] || '';
      document.getElementById('edit-medc-id').value = condition.medc_id; // Assuming you have a hidden input for the ID


      const associatedMedications = await getMedicationAssociated(condition.medc_id); // Medications already associated
      const medicationList = await getAllMedications(); // All medications (including associated ones)

      // Filter out medications that are already in the associated list
      const medicationsNotAssociated = medicationList.filter(med => 
        !associatedMedications.some(associated => associated.med_id === med.med_id)
      );

      

      fillMyMedications(medicationsNotAssociated, medicalConditionId);
      fillAssociatedMedications(associatedMedications, medicalConditionId);
      // Show the popup for updating medical condition
      openPopup('edit-medical-condition-popup');
    }
  }
});


async function updateAssociationUI(medicalConditionId) {
  const associatedMedications = await getMedicationAssociated(medicalConditionId); // Medications already associated
  const medicationList = await getAllMedications(); // All medications (including associated ones)

  // Filter out medications that are already in the associated list
  const medicationsNotAssociated = medicationList.filter(med => 
    !associatedMedications.some(associated => associated.med_id === med.med_id)
  );

  fillMyMedications(medicationsNotAssociated, medicalConditionId);
  fillAssociatedMedications(associatedMedications, medicalConditionId);

}

// Open the popup by ID
function openPopup(id) {
  document.getElementById(id).style.display = "block";
}

// Close the popup
function closePopup(id) {
  document.getElementById(id).style.display = "none";
}


async function updateMedication(data) {
  const user = JSON.parse(localStorage.getItem("user"));
  try {
    const response = await fetch(`/updateMedication/${data.med_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(data)
    });
          autoLogout(response);
    if (response.ok) {
      alert('Medication updated successfully!');
      closePopup('edit-medication-popup');
      await retrieveMedicationData();
      loadMedication();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || 'Failed to update medication'}`);
    }
  } catch (err) {
    console.error(err);
    alert('Network or server error');
  }
}

async function updateMedicalCondition(data) {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log('Updating medical condition with data:', data);
  try {
    const response = await fetch(`/updateMedicalCondition/${data.medc_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(data)
    });

          autoLogout(response);
    if (response.ok) {
      alert('Medical condition updated successfully!');
      closePopup('edit-medical-condition-popup');
      await retrieveMedicalConditionData();
      loadMedical();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || 'Failed to update medical condition'}`);
    }
  } catch (err) {
    console.error(err);
    alert('Network or server error');
  }
}

//Updating medication and medical condition data when the save button is clicked
document.addEventListener('click', async function(event) {
  const user = JSON.parse(localStorage.getItem("user"));
  // Check if the clicked element has the "save-changes-btn" class
  if (event.target.classList.contains('m-save-changes-btn')) {
    event.preventDefault(); // Prevent form submission (if it's inside a form)

    // Gather values from the form inputs
    console.log('Saving changes for medication...');
    const name = document.getElementById('edit-med-name').value;
    const description = document.getElementById('edit-med-desc').value || '';
    const dosage = document.getElementById('edit-med-dosage').value;
    const time = document.getElementById('edit-med-time').value;
    const frequency = document.getElementById('edit-med-frequency').value;
    const startDate = document.getElementById('edit-med-start-date').value;

    // Get the medication ID
    const medicationId = parseInt(document.getElementById('edit-med-id').value);  // Assuming the ID is stored somewhere in the hidden input

    // Create the data object to send to the update function
    const updatedMedication = {
      med_id: medicationId,
      name: name,
      description: description,
      dosage: dosage,
      time: time,
      frequency: frequency,
      start_date: startDate
    };

      if (updatedMedication.frequency === 'W') {
        await saveWeeklyTimings(medicationId);
      }

    console.log('Updating medication with data:', updatedMedication);

    // Call the updateMedication function with the updated data
    await updateMedication(updatedMedication);
  }

    if (event.target.classList.contains('mc-save-changes-btn')) {
    event.preventDefault(); // Prevent form submission (if it's inside a form)
    
    // Get the medication ID
    const conditionId = document.getElementById('edit-medc-id').value;  // Assuming the ID is stored somewhere in the hidden input
    // Gather values from the form inputs
    console.log('Saving changes for medical condition...');
    const name = document.getElementById('edit-medc-name').value;
    const description = document.getElementById('edit-medc-descr').value || '';
    const prescriptionDate = document.getElementById('edit-medc-date').value;
    const updatedAt = new Date().toISOString(); // Get the current date and time for updated_at
    const modId = user.id; // Assuming you want to use the current user's ID as mod_id


    // Create the data object to send to the update function
    const updatedCondition = {
      medc_id: conditionId,
      name: name,
      descr: description,
      prescription_date: prescriptionDate,
      updated_at: updatedAt, // Use the current date and time
      mod_id: modId // Use the current user's ID as mod_id
    };

    console.log('Updating medication with data:', updatedCondition);

    // Call the updateMedication function with the updated data
    await updateMedicalCondition(updatedCondition);
  }
});

document.getElementById('edit-med-frequency').addEventListener('change', (e) => {
  const isWeekly = e.target.value === 'W';
  document.getElementById('edit-weekly-timings-editor').classList.toggle('hidden', !isWeekly);
});


async function loadWeeklyTimings(med_id) {
  const user = JSON.parse(localStorage.getItem("user"));
  const container = document.getElementById('edit-weekly-timings-list');
  container.innerHTML = '';

  try {
    const res = await fetch(`/getWeeklyTiming/${med_id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    const timings = await res.json();

    timings.forEach(t => addWeeklyTiming(t.day, t.time));
    document.getElementById('edit-weekly-timings-editor').classList.remove('hidden');
  } catch (err) {
    console.error('Failed to load weekly timings:', err);
  }
}

function addWeeklyTiming(day = '1', time = '08:00') {
  const container = document.getElementById('edit-weekly-timings-list');

  const row = document.createElement('div');
  row.className = 'weekly-timing-row';

  row.innerHTML = `
    <select class="weekly-day">
      ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) =>
        `<option value="${i+1}" ${day == i+1 ? 'selected' : ''}>${d}</option>`).join('')}
    </select>
    <input type="time" class="weekly-time" value="${time ? time.substring(11, 16) : ''}">
    <button type="button" onclick="this.parentElement.remove()">Remove</button>
  `;

  container.appendChild(row);
}

async function saveWeeklyTimings(med_id) {
  const user = JSON.parse(localStorage.getItem("user"));

  // Reset all existing timings
  await fetch(`/resetWeeklyTiming/${med_id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${user.token}` }
  });

  // Recreate new ones
  const rows = document.querySelectorAll('.weekly-timing-row');
  for (const row of rows) {
    const day = row.querySelector('.weekly-day').value;
    const time = row.querySelector('.weekly-time').value;

    await fetch('/saveWeeklyTiming', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({ day, time, med_id })
    });
  }
}


function fillMyMedications(medicationList, medc_id) {
  // Select the container for available medications
  const medicationsContainer = document.querySelector("#available-medications-list");

  // Clear any previous content
  medicationsContainer.innerHTML = '';

  // Loop through each medication in the medicationList
  medicationList.forEach(med => {
    // Create a new div element for each medication
    const medElement = document.createElement("div");
    medElement.classList.add("medication-item");

    // Add the medication name and the plus button
    medElement.innerHTML = `
      <div>
      <span><strong>${med.name}</strong></span><br>
      <span>${med.description || 'No description available'}</span>
      </div>
      <button class="add-medication-btn add" data-med-id="${med.med_id}" data-medc-id="${medc_id}">+</button>
    `;

    // Append the new medication element to the container
    medicationsContainer.appendChild(medElement);
  });

  // Optional: Add event listeners to each "add" button for future functionality
  document.querySelectorAll('.add-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const medId = e.target.getAttribute('data-med-id');
      console.log('Add medication with ID:', medId);
      // You can call the function to add medication to the condition here
      // Example: addMedicationToCondition(medId);
    });
  });
}

function fillAssociatedMedications(medicationList, medc_id) {

  const associatedContainer = document.querySelector("#associated-medications-list");
  associatedContainer.innerHTML = '';
  medicationList.forEach(med => {
    const medElement = document.createElement("div");
    medElement.classList.add("medication-item");

    medElement.innerHTML = `
      <div>
      <span><strong>${med.name}</strong></span><br>
      <span>${med.description || 'No description available'}</span>
      </div>
      <button class="remove-medication-btn remove" data-med-id="${med.med_id}" data-medc-id="${medc_id}">-</button>
    `;

    associatedContainer.appendChild(medElement);
  });
}

async function getMedicationAssociated(medc_id) {
  const user = JSON.parse(localStorage.getItem("user"));

  const response = await fetch(`/getMedicationAssociatedWithMedicalCondition/${medc_id}`, {
    method: 'GET',
    headers: {
      "authorization": `Bearer ${user.token}`
    }
  });

  autoLogout(response);

  if (!response.ok) {
    console.error('Failed to retrieve medications:', response.statusText);
    return [];
  }

  const medications = await response.json();
  const cleaned = medications.filter(med => med !== null && med !== undefined);

  return cleaned;
}

async function getAllMedications() {
  const user = JSON.parse(localStorage.getItem("user"));

  const response = await fetch(`/getMedicationByAccountID`, {
    method: 'GET',
    headers: {
      "authorization": `Bearer ${user.token}`
    }
  });

        autoLogout(response);

  if (!response.ok) {
    console.error('Failed to retrieve medications:', response.statusText);
    return [];
  }

  const medications = await response.json();
  return medications;
}

//Adds & Removes associations between medications and medical conditions
document.addEventListener('click', async function(event) {
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Handle adding medication to a medical condition
  if (event.target.classList.contains('add-medication-btn')) {
      event.preventDefault(); // Prevent default button behavior  
    const medId = event.target.getAttribute('data-med-id');
    const medcId = event.target.getAttribute('data-medc-id');

    try {
      const response = await fetch(`/associateMedicationWithMedicalCondition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ med_id: medId, medc_id: medcId })
      });

      autoLogout(response);

      if (response.ok) {
        await updateAssociationUI(medcId); // Update the UI with the new association
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to associate medication'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network or server error');
    }
  }

  // Handle removing medication from a medical condition
  if (event.target.classList.contains('remove-medication-btn')) {
    event.preventDefault(); // Prevent default button behavior
    const medId = event.target.getAttribute('data-med-id');
    const medcId = event.target.getAttribute('data-medc-id');

    try {
      const response = await fetch(`/deleteMedicationConditionAssociation`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ med_id: medId, medc_id: medcId })
      });

      autoLogout(response);

      if (response.ok) {
        await updateAssociationUI(medcId); // Update the UI with the new association
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to remove medication'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network or server error');
    }
  }
});

function autoLogout(response) {
  if (response.status === 403) {
    alert("Session expired. Please log in again.");
    localStorage.removeItem("user");
    window.location.href = "login.html";
    return;
  }
}



const medFrequency = document.getElementById("med-frequency");
const weeklyTimingContainer = document.getElementById("weekly-timing-container");
const weeklyTimingsList = document.getElementById("weekly-timings-list");
const addWeeklyTimeBtn = document.getElementById("add-weekly-time");
const medicationTime = document.getElementById("med-time");

let weeklyTimings = [];

// Show/hide weekly timing section
medFrequency.addEventListener("change", () => {
  if (medFrequency.value === "W") {
    weeklyTimingContainer.style.display = "block";
    medicationTime.style.display = "none"; // Hide single time input
    medicationTime.removeAttribute("required");
  } else if (medFrequency.value === "WR") {
    weeklyTimingContainer.style.display = "none";
    medicationTime.style.display = "none"; // Show single time input
  }
  else {
    weeklyTimingContainer.style.display = "none";
    weeklyTimings = []; // Clear if switching out
    weeklyTimingsList.innerHTML = "";
    medicationTime.style.display = "block"; // Show single time input
      medicationTime.setAttribute("required", "required");
  }
});

// Add new weekly timing
addWeeklyTimeBtn.addEventListener("click", () => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("weekly-time-entry");

  wrapper.innerHTML = `
    <select class="week-day">
      <option value="1">Monday</option>
      <option value="2">Tuesday</option>
      <option value="3">Wednesday</option>
      <option value="4">Thursday</option>
      <option value="5">Friday</option>
      <option value="6">Saturday</option>
      <option value="7">Sunday</option>
    </select>
    <input type="time" class="week-time" required />
    <button type="button" class="remove-weekly-time">Remove</button>
  `;

  wrapper.querySelector(".remove-weekly-time").addEventListener("click", () => {
    wrapper.remove();
  });

  weeklyTimingsList.appendChild(wrapper);
});

// On medication form submit, collect weekly timings and post
medicationForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const user = JSON.parse(localStorage.getItem("user"));
  const formData = new FormData(medicationForm);

  const payload = {
    name: formData.get('name'),
    description: formData.get('description') || ' ',
    dosage: formData.get('dosage'),
    time: formData.get('time') || null, // Use single time input if not weekly
    frequency: formData.get('frequency'),
    start_date: formData.get('start_date') || new Date().toISOString().split('T')[0], // Default to today if not provided
    account_id: user.id
  };

  console.log('Payload:', payload);

  try {
    const response = await fetch(`/createMedication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(payload)
    });

    autoLogout(response);

    if (response.ok) {
      const med = await response.json();
      console.log('Medication created:', med);
      const med_id = med.med_id || med.id; // assuming backend returns new med_id

    if (payload.frequency === "W") {
      const timingData = Array.from(document.querySelectorAll(".weekly-time-entry")).map(entry => {
        const dayVal = entry.querySelector(".week-day")?.value;
        const timeVal = entry.querySelector(".week-time")?.value;

        console.log("Day:", dayVal, "Time:", timeVal); // Debugging

        return {
          med_id,
          day: dayVal ? parseInt(dayVal) : null,
          time: timeVal || null
        };
      });

      console.log("Weekly Timing Data:", timingData); // Debugging
      for (const timing of timingData) {
        await fetch(`/saveWeeklyTiming`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(timing)
        });
      }
    }

      alert('Medication added successfully!');
      closePopup('medication-popup');
      medicationForm.reset();
      weeklyTimingsList.innerHTML = "";
      await retrieveMedicationData();
      loadMedication();
    } else {
      const error = await response.json();
      console.log("Raw response:", response);
      alert(`Error: ${error.message || 'Failed to submit medication'}`);
    }
  } catch (err) {
    console.error(err);
    alert('Network or server error');
  }
});


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






















