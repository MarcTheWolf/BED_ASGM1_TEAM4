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


document.getElementById('searchForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const address = document.getElementById('searchInput').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.textContent = 'Searching...';
    try {
        const coords = await getCoordinates(address);
        if (coords) {
            resultsDiv.textContent = `Coordinates: Lat ${coords.lat}, Lng ${coords.lng}`;
        } else {
            resultsDiv.textContent = 'No results found.';
        }
    } catch (err) {
        resultsDiv.textContent = 'Error fetching coordinates.';
    }
});