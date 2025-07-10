const db = require('../models/db');
const bcrypt = require('bcrypt');

// Function to create an admin user
async function createAdminUser() {
  const adminData = {
    name: 'Admin User',
    email: 'admin@farumasi.com', // Change this to your desired admin email
    password: 'admin123', // Change this to a secure password
    role: 'admin'
  };

  try {
    // Check if admin already exists
    const existingAdmin = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [adminData.email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingAdmin) {
      console.log('Admin user already exists with email:', adminData.email);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Insert admin user
    await new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO users (name, email, password, role, insurance_providers)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.run(sql, [
        adminData.name,
        adminData.email.toLowerCase(),
        hashedPassword,
        adminData.role,
        JSON.stringify([])
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    console.log('Admin user created successfully!');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('Role: admin');
    console.log('\nPlease change the password after first login!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close database connection
    db.close();
  }
}

// Run the function
createAdminUser();
