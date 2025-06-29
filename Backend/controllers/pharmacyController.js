const db = require('../models/db');

// 🏥 Register a new pharmacy
exports.registerPharmacy = (req, res) => {
  const {
    name, email, phone, address, insurance_accepted,
    country, province, district, sector, village,
    latitude, longitude, is_active
  } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Coordinates are required' });
  }

  const insuranceJSON = JSON.stringify(insurance_accepted || []);
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  const pharmacySql = `
    INSERT INTO pharmacies (
      name, email, phone, address, insurance_accepted, created_at, updated_at, is_active
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    pharmacySql,
    [name, email, phone, address, insuranceJSON, createdAt, updatedAt, is_active ?? 1],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });

      const pharmacyId = this.lastID;

      const locationSql = `
        INSERT INTO locations (
          pharmacy_id, country, province, district, sector, village, latitude, longitude
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(
        locationSql,
        [
          pharmacyId, country || null, province || null, district || null,
          sector || null, village || null, latitude, longitude
        ],
        function (locErr) {
          if (locErr) return res.status(400).json({ error: locErr.message });

          res.status(201).json({
            message: 'Pharmacy registered successfully',
            pharmacyId
          });
        }
      );
    }
  );
};

// 📋 Get all pharmacies with pagination
exports.getAllPharmacies = (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  const sql = `
    SELECT 
      p.id, p.name, p.email, p.phone, p.address, p.insurance_accepted,
      p.created_at, p.updated_at, p.is_active,
      l.country, l.province, l.district, l.sector, l.village, l.latitude, l.longitude
    FROM pharmacies p
    LEFT JOIN locations l ON p.id = l.pharmacy_id
    LIMIT ? OFFSET ?
  `;

  db.all(sql, [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const pharmacies = rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      insurance_accepted: JSON.parse(row.insurance_accepted || "[]"),
      is_active: !!row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      location: {
        country: row.country,
        province: row.province,
        district: row.district,
        sector: row.sector,
        village: row.village,
        coordinate: {
          latitude: row.latitude,
          longitude: row.longitude
        }
      }
    }));

    res.json({
      limit,
      offset,
      count: pharmacies.length,
      data: pharmacies
    });
  });
};

// 🔍 Get pharmacy by ID
exports.getPharmacyById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      p.id, p.name, p.email, p.phone, p.address, p.insurance_accepted,
      p.created_at, p.updated_at, p.is_active,
      l.country, l.province, l.district, l.sector, l.village, l.latitude, l.longitude
    FROM pharmacies p
    LEFT JOIN locations l ON p.id = l.pharmacy_id
    WHERE p.id = ?
  `;

  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Pharmacy not found' });

    const pharmacy = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      insurance_accepted: JSON.parse(row.insurance_accepted || "[]"),
      is_active: !!row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      location: {
        country: row.country,
        province: row.province,
        district: row.district,
        sector: row.sector,
        village: row.village,
        coordinate: {
          latitude: row.latitude,
          longitude: row.longitude
        }
      }
    };

    res.json(pharmacy);
  });
};
