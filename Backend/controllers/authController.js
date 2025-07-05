const db = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

// Register user
exports.register = async (req, res) => {
  const { name, email, password, insurance_providers, latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Coordinates required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const insuranceJSON = JSON.stringify(insurance_providers || []);

    const userSql = `
      INSERT INTO users (name, email, password, insurance_providers)
      VALUES (?, ?, ?, ?)
    `;
    db.run(userSql, [name, email.toLowerCase(), hashedPassword, insuranceJSON], function (err) {
      if (err) return res.status(400).json({ error: err.message });

      const userId = this.lastID;
      const locSql = `
        INSERT INTO locations (user_id, latitude, longitude)
        VALUES (?, ?, ?)
      `;
      db.run(locSql, [userId, latitude, longitude], function (locErr) {
        if (locErr) return res.status(400).json({ error: locErr.message });
        res.status(201).json({ message: 'User registered', userId });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login user and optionally update coordinates
exports.login = (req, res) => {
  const { email, password, latitude, longitude } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const sql = `
    SELECT u.id, u.name, u.email, u.role, u.insurance_providers, u.password,
           l.country, l.province, l.district, l.sector, l.village, l.latitude AS loc_lat, l.longitude AS loc_lon
    FROM users u
    LEFT JOIN locations l ON u.id = l.user_id
    WHERE u.email = ?
  `;

  db.get(sql, [email.toLowerCase()], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Function to send final response
    const sendResponse = (updatedLat, updatedLon) => {
      delete user.password;
      user.insurance_providers = JSON.parse(user.insurance_providers || "[]");

      const location = {
        country: user.country,
        province: user.province,
        district: user.district,
        sector: user.sector,
        village: user.village,
        coordinate: {
          latitude: updatedLat !== undefined ? updatedLat : user.loc_lat,
          longitude: updatedLon !== undefined ? updatedLon : user.loc_lon
        }
      };

      // Clean up user object
      delete user.country;
      delete user.province;
      delete user.district;
      delete user.sector;
      delete user.village;
      delete user.loc_lat;
      delete user.loc_lon;

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '3d' });

      res.json({
        token,
        user: {
          ...user,
          location
        }
      });
    };

    // Update coordinates only if both latitude and longitude are provided and valid
    if (
      latitude !== undefined && longitude !== undefined &&
      !isNaN(latitude) && !isNaN(longitude) &&
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    ) {
      const updateLocSql = `UPDATE locations SET latitude = ?, longitude = ? WHERE user_id = ?`;
      db.run(updateLocSql, [latitude, longitude, user.id], function (locErr) {
        if (locErr) {
          console.error('Failed to update location on login:', locErr.message);
          // Continue to send response even if update fails
          sendResponse(user.loc_lat, user.loc_lon);
        } else {
          sendResponse(latitude, longitude);
        }
      });
    } else {
      // If no valid coordinates provided, just send response with existing location
      sendResponse(user.loc_lat, user.loc_lon);
    }
  });
};

// Update user location (after login)
exports.updateLocation = (req, res) => {
  const userId = req.user.id;
  const { latitude, longitude, country, province, district, sector, village } = req.body;

  if (
    latitude === undefined || longitude === undefined ||
    isNaN(latitude) || isNaN(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) {
    return res.status(400).json({ error: 'Valid latitude and longitude required' });
  }

  let updateSql = `UPDATE locations SET`;
  const params = [];
  if (latitude !== undefined) {
    updateSql += ` latitude = ?`;
    params.push(latitude);
  }
  if (longitude !== undefined) {
    updateSql += `, longitude = ?`;
    params.push(longitude);
  }
  if (country !== undefined) {
    updateSql += `, country = ?`;
    params.push(country);
  }
  if (province !== undefined) {
    updateSql += `, province = ?`;
    params.push(province);
  }
  if (district !== undefined) {
    updateSql += `, district = ?`;
    params.push(district);
  }
  if (sector !== undefined) {
    updateSql += `, sector = ?`;
    params.push(sector);
  }
  if (village !== undefined) {
    updateSql += `, village = ?`;
    params.push(village);
  }
  params.push(userId)
  updateSql += ` WHERE user_id = ?`;
  db.run(updateSql, params, function (err) {
    if (err) return res.status(500).json({ error: 'Failed to update location' });
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Location not found for user' });
    }
    res.json({ message: 'Location updated' });
  });
};
