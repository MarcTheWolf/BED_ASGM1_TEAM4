document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOMContentLoaded event fired");

    var address = await getAddress();
    console.log("Fetched address:", address);

    displayAddress(address);    // Display the address on the page


    console.log("Display map function called with address:", address);
    
    if (!address) {
        console.error("No address provided for map display");
        return;
    }

    const mapCoords = await getCoordinates(address);

    if (!mapCoords) {
        console.error("Failed to get coordinates for address:", address);
        return;
    }

    const map = L.map('map').setView([mapCoords.lat, mapCoords.lng], 13); //Display map

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}, { maxZoom: 19 }).addTo(map);

    window.map = map;

});

function displayAddress(address) {
    let currentAddress = document.getElementById("homeAddress");
    console.log("currentAddress element:", currentAddress);
    console.log("Address to display:", address);

    if (!address) {
        currentAddress.textContent = "No address recorded";
    } else {
        currentAddress.textContent = address;
    }
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
        const response = await fetch(`/api/maps/getAddress`,{ // Fetch address from the server
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

//Update address form submission
updateAddressForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const address = document.getElementById("newAddressInput").value;

    try {
        var updatedAddress = await updateAddress(address);
        showMessagePopover("Address updated successfully!");
        addAddressModal.classList.add("hidden");
        updateAddressForm.reset();
        await displayAddress(updatedAddress);
    } catch (error) {
        console.error("Error updating address:", error);
        showMessagePopover("Failed to update address. Please try again.");
    }
});



async function updateAddress(address) {

    const user = JSON.parse(localStorage.getItem('user'));
    console.log("Update address function called");
    console.log("User from localStorage:", user);

    if (!user || !user.token) {
        console.error("User is not authenticated");
        return;
    }
    //update address in db
    try {
        const response = await fetch(`/api/maps/updateAddress`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                accountId: parseInt(user.id),
                address: address
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update address');
        }

        const data = await response.json();
        console.log("Address updated successfully:", data);
        return data.address;
    } catch (error) {
        console.error("Error updating address:", error);
    }
}

const deleteAddressButton = document.getElementById("deleteAddressBtn");
//delete address
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

//get geochache coords for locations
async function getCoordinates(address) {
    const res = await fetch(`/api/maps/geocode?address=${encodeURIComponent(address)}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}`
        }
        
    });
    const data = await res.json();
    if (data.lat && data.lng) {
        console.log("Lat:", data.lat, "Lng:", data.lng);
        return data;
    } else {
        console.error("Geocoding failed");
    }
}



document.getElementById('use-home-btn').addEventListener('click', function() {
    var home = document.getElementById('homeAddress').textContent;
    if (home === "No address recorded") {
        showMessagePopover("No home address set. Please update your address first.");
        return;
    }
    document.getElementById('addressInput').value = home;
    console.log("Home address used for search:", home);
})

//######################################################3

let routeLayer;
let routeMarkers = []; 
//Add routing on the map
document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const startAddress = document.getElementById('addressInput').value;
    const destAddress = document.getElementById('searchInput').value;

    const routeType = document.querySelector('input[name="routeType"]:checked').value;

    const startCoords = await getCoordinates(startAddress);
    const destCoords = await getCoordinates(destAddress);

    if (!startCoords || !destCoords) {
        showMessagePopover("Failed to get coordinates for start or destination address. Please check the addresses.");
        return;
    }

    //get the route
    const routeRes = await fetch(`/api/maps/route?startLat=${startCoords.lat}&startLng=${startCoords.lng}&endLat=${destCoords.lat}&endLng=${destCoords.lng}&routeType=${routeType}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}`
        }
    });

    const routeData = await routeRes.json();
    console.log("Route data:", routeData);

    if (routeData.error) throw new Error(routeData.error);

    displayMarkersAndRoute(startCoords, destCoords, routeData);

    } catch (err) {
        showMessagePopover(`Error: ${err.message}`);
    }
});

//display markers and route on the map
function displayMarkersAndRoute(startCoords, destCoords, routeData){

    if (routeLayer) {
        map.removeLayer(routeLayer);
    }
    // Remove existing markers
    routeMarkers.forEach(marker => map.removeLayer(marker));
    routeMarkers = [];

    const coords = polyline.decode(routeData.route_geometry);

    const latLngs = coords.map(([lat, lng]) => ({ lat, lng }));
    // add the route line to the map
    const geojson = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: latLngs.map(coord => [coord.lng, coord.lat])
        },
        properties: {
        }
    };

    routeLayer = L.geoJSON(geojson, {
        style: { color: 'blue' }
    }).addTo(map);

    map.fitBounds(routeLayer.getBounds());

    L.marker([startCoords.lat, startCoords.lng]).addTo(map).bindPopup('Start').openPopup();
    L.marker([destCoords.lat, destCoords.lng]).addTo(map).bindPopup('Destination');
    // Add markers for start and destination
    map.fitBounds(routeLayer.getBounds());
    
}



function showMessagePopover(message, timeout = 3000) { //Popup message
    const popover = document.getElementById('messagePopover');
    const msgSpan = document.getElementById('popoverMessage');
    if (popover && msgSpan) {
        msgSpan.textContent = message;
        popover.classList.remove('hidden');
        if (timeout > 0) {
            setTimeout(() => popover.classList.add('hidden'), timeout);
        }
    } else {
        console.error("Popover or message span not found in the DOM.");
    }
}


document.getElementById('closePopover').onclick = function() {
    document.getElementById('messagePopover').classList.add('hidden');
};
