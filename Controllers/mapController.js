const express = require('express');
const router = express.Router();
const geoService = require('../Services/mapModel.js');

router.get('/geocode', async (req, res) => {
    const { address } = req.query;
    if (!address) {
        return res.status(400).json({ error: 'Address is required' });
    }

    try {
        const coords = await geoService.geocode(address);
        res.json(coords);
    } catch (err) {
        console.error('Geocode error:', err.message);
        res.status(500).json({ error: 'Geocoding failed' });
    }
});
router.get('/route', async (req, res) => {
  const { startLat, startLng, endLat, endLng, routeType } = req.query;

  if (!startLat || !startLng || !endLat || !endLng || !routeType) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  let token = geoService.getInMemoryAccessToken();
  if (!token) {
    try {
      token = await geoService.getAccessToken();
    } catch (err) {
      return res.status(500).json({ error: 'Unable to refresh token', details: err.message });
    }
  }

  const onemapURL = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${startLat},${startLng}&end=${endLat},${endLng}&routeType=${routeType}`;

  try {
    const response = await fetch(onemapURL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("OneMap API failed:", text);
      return res.status(500).json({ error: 'OneMap API error', details: text });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse OneMap response as JSON:", text);
      return res.status(500).json({ error: 'Invalid JSON from OneMap', body: text });
    }

    res.json(data);

  } catch (err) {
    console.error("Fetch failed:", err);
    res.status(500).json({ error: 'Failed to fetch route', details: err.message });
  }
});

router.get('/getAddress', async (req, res) => {
    
    const accountId = req.user.id; // Assuming user ID is stored in the JWT token

    if (isNaN(accountId)) {
        return res.status(400).json({ error: 'Invalid account ID' });
    }

    try {
        const address = await geoService.getUserAddress(accountId);
        return res.json(address);
    } catch (err) {
        console.error('Error fetching user address:', err.message);
        res.status(500).json({ error: 'Failed to fetch user address' });
    }
});

router.put('/updateAddress', async (req, res) => {
    const { accountId, address } = req.body;
    
    if (!accountId || !address) {
        return res.status(400).json({ error: 'Account ID and address are required' });
    }
    try {
        const updatedAddress = await geoService.updateUserAddress(accountId, address);
        return res.json({ address: updatedAddress });
    } catch (err) {
        console.error('Error updating user address:', err.message);
        res.status(500).json({ error: 'Failed to update user address' });
    }
});

router.put('/deleteAddress', async (req, res) => {
    const { accountId } = req.body;
    if (!accountId) {
        return res.status(400).json({ error: 'Account ID is required' });
    }
    try {
        const deleted = await geoService.deleteAddress(accountId);
        res.json({ deleted });
    } catch (err) {
        console.error('Error deleting user address:', err.message);
        res.status(500).json({ error: 'Failed to delete user address' });
    }
});

module.exports = router;