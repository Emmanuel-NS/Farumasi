const db = require('../models/db');

// 🔄 Update location by user_id
exports.updateLocationByUserId = (req, res) => {
  const userId = req.user?.id || req.params.userId;
  const { country, province, district, sector, village, latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const sql = `
    UPDATE locations
    SET country = ?, province = ?, district = ?, sector = ?, village = ?, latitude = ?, longitude = ?
    WHERE user_id = ?
  `;

  db.run(sql, [country, province, district, sector, village, latitude, longitude, userId], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to update user location' });
    if (this.changes === 0) return res.status(404).json({ error: 'Location not found for user' });

    res.json({ message: 'User location updated' });
  });
};

// 🔄 Update location by pharmacy_id
exports.updateLocationByPharmacyId = (req, res) => {
  const { pharmacyId } = req.params;
  const { country, province, district, sector, village, latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const sql = `
    UPDATE locations
    SET country = ?, province = ?, district = ?, sector = ?, village = ?, latitude = ?, longitude = ?
    WHERE pharmacy_id = ?
  `;

  db.run(sql, [country, province, district, sector, village, latitude, longitude, pharmacyId], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to update pharmacy location' });
    if (this.changes === 0) return res.status(404).json({ error: 'Location not found for pharmacy' });

    res.json({ message: 'Pharmacy location updated' });
  });
};

// 🔍 Get location by user_id
exports.getLocationByUserId = (req, res) => {
  const { userId } = req.params;
  db.get(`SELECT * FROM locations WHERE user_id = ?`, [userId], (err, location) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch location' });
    if (!location) return res.status(404).json({ error: 'Location not found' });
    res.json(location);
  });
};

// 🔍 Get location by pharmacy_id
exports.getLocationByPharmacyId = (req, res) => {
  const { pharmacyId } = req.params;
  db.get(`SELECT * FROM locations WHERE pharmacy_id = ?`, [pharmacyId], (err, location) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch location' });
    if (!location) return res.status(404).json({ error: 'Location not found' });
    res.json(location);
  });
};

// 📋 Get all locations
exports.getAllLocations = (req, res) => {
  db.all('SELECT * FROM locations', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch locations' });
    res.json(rows);
  });
};
