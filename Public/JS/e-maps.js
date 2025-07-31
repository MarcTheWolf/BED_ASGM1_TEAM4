document.addEventListener("DOMContentLoaded", displayAddress)


async function displayAddress() {
    let currentAddress = document.getElementById("homeAddress");
    
    getAddress().then(address => {
            if (address) {
                currentAddress.textContent = address;
            } else {
                currentAddress.textContent = "No address recorded";
            }
        }).catch(err => {
            console.error("Error fetching address:", err);
            currentAddress.textContent = "Error fetching address";
        });
}

async function getAddress() {

    const user = JSON.parse(localStorage.getItem('user'));
    console.log("DOMContentLoaded fired");
    console.log("User from localStorage:", user);

    if (!user || !user.token) {
        console.error("User is not authenticated");
        return '';
    }
    try {
        const response = await fetch(`/api/maps/getAddress`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch address');
        }

        const data = await response.json();
        return data || '';
    } catch (error) {
        console.error("Error fetching address:", error);
        return '';
    }
}

const updateAddressForm = document.getElementById("addAddressForm");

let addAddressModal = document.getElementById("addAddressModalBackdrop");
let closeAddAddressModal = document.getElementById("closeAddAddressModal");
let openAddAddressModal = document.getElementById("updateAddressModalButton");


openAddAddressModal.addEventListener("click", function () {
    addAddressModal.classList.remove("hidden");
});

closeAddAddressModal.addEventListener("click", function () {
    updateAddressForm.reset();
    addAddressModal.classList.add("hidden");
});


updateAddressForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const address = document.getElementById("addressInput").value;

    try {
        await updateAddress(address);
        alert("Address updated successfully!");
        addAddressModal.classList.add("hidden");
        updateAddressForm.reset();
        await displayAddress();
    } catch (error) {
        console.error("Error updating address:", error);
        alert("Failed to update address. Please try again.");
    }
});



async function updateAddress(address) {

    const user = JSON.parse(localStorage.getItem('user'));
    console.log("Update address function called");

    if (!user || !user.token) {
        console.error("User is not authenticated");
        return;
    }

    try {
        const response = await fetch(`/api/maps/updateAddress`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                accountId: user.id,
                address: address
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update address');
        }

        const data = await response.json();
        console.log("Address updated successfully:", data);
    } catch (error) {
        console.error("Error updating address:", error);
    }
}

const deleteAddressButton = document.getElementById("deleteAddressBtn");

deleteAddressButton.addEventListener("click", async function (event) {
    event.preventDefault();

    try{
    await deleteAddress();
    alert("Address deleted successfully!");
    await displayAddress();
    } catch (error) {
        console.error("Error deleting address:", error);
    }
})

async function deleteAddress() {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("Delete address function called");

    if (!user || !user.token) {
        console.error("User is not authenticated");
        return;
    }
    try {
        const response = await fetch(`/api/maps/deleteAddress`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                accountId: user.id
            })
        });

        if (!response.ok) {
            throw new Error('Failed to delete address');
        }

        const data = await response.json();
        console.log("Address deleted successfully:", data);
    } catch (error) {
        console.error("Error deleting address:", error);
    }
}

async function getCoordinates(address) {
    const res = await fetch(`/api/maps/geocode?address=${encodeURIComponent(address)}`);
    const data = await res.json();
    if (data.lat && data.lng) {
        console.log("Lat:", data.lat, "Lng:", data.lng);
        return data;
    } else {
        console.error("Geocoding failed");
    }
}




const map = L.map('map').setView([1.3521, 103.8198], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
let markerGroup = L.layerGroup().addTo(map);
let routeLayer;

document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const startAddress = document.getElementById('addressInput').value;
    const destAddress = document.getElementById('searchInput').value;

    const startCoords = await getCoordinates(startAddress);
    const destCoords = await getCoordinates(destAddress);

    const routeRes = await fetch(`/api/maps/route?startLat=${startCoords.lat}&startLng=${startCoords.lng}&endLat=${destCoords.lat}&endLng=${destCoords.lng}&routeType=drive`);
    const routeData = await routeRes.json();

    if (routeData.error) throw new Error(routeData.error);


    const coords = polyline.decode(routeData.route_geometry);

    const latLngs = coords.map(([lat, lng]) => ({ lat, lng }));

    const geojson = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: latLngs.map(coord => [coord.lng, coord.lat])
        },
        properties: {
        }
    }
    if (routeLayer) map.removeLayer(routeLayer);

    routeLayer = L.geoJSON(geojson, {
        style: { color: 'blue' }
    }).addTo(map);

    map.fitBounds(routeLayer.getBounds());
        // Markers
        L.marker([startCoords.lat, startCoords.lng]).addTo(map).bindPopup('Start').openPopup();
        L.marker([destCoords.lat, destCoords.lng]).addTo(map).bindPopup('Destination');

        map.fitBounds(routeLayer.getBounds());

    } catch (err) {
        alert(`Error: ${err.message}`);
    }
});