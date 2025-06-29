const db = require('../models/db');

const sampleLocations = [
  {
    country: 'Rwanda',
    province: 'Northern',
    district: 'Gicumbi',
    sector: 'Byumba',
    village: 'Rugarama',
    latitude: -1.5788,
    longitude: 30.0629,
  },
  {
    country: 'Rwanda',
    province: 'Kigali City',
    district: 'Gasabo',
    sector: 'Kimironko',
    village: 'Bibare',
    latitude: -1.9345,
    longitude: 30.1037,
  }
];

sampleLocations.forEach((loc) => {
  db.run(`
    INSERT INTO locations (
      country, province, district, sector, village, latitude, longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [loc.country, loc.province, loc.district, loc.sector, loc.village, loc.latitude, loc.longitude],
    (err) => {
      if (err) console.error('Insert error:', err.message);
    }
  );
});

console.log('Sample locations inserted successfuly');
