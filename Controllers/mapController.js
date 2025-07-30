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

module.exports = router;