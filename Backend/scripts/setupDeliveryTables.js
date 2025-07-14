const db = require('../models/db');

// Create delivery-related tables
function createDeliveryTables() {
  console.log('Creating delivery tracking tables...');
  
  // Create delivery agents table
  const createDeliveryAgentsTable = `
    CREATE TABLE IF NOT EXISTS delivery_agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'busy')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // Create delivery locations table for real-time tracking
  const createDeliveryLocationsTable = `
    CREATE TABLE IF NOT EXISTS delivery_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      agent_id INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accuracy REAL DEFAULT 0,
      speed REAL DEFAULT 0,
      heading REAL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (agent_id) REFERENCES delivery_agents (id)
    )
  `;
  
  // Add delivery_agent_id column to orders table if it doesn't exist
  const addDeliveryAgentToOrders = `
    ALTER TABLE orders ADD COLUMN delivery_agent_id INTEGER REFERENCES delivery_agents(id)
  `;
  
  // Create indexes for better performance
  const createIndexes = [
    `CREATE INDEX IF NOT EXISTS idx_delivery_locations_order_id ON delivery_locations(order_id)`,
    `CREATE INDEX IF NOT EXISTS idx_delivery_locations_updated_at ON delivery_locations(updated_at)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_delivery_agent ON orders(delivery_agent_id)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`
  ];
  
  // Execute table creation
  db.run(createDeliveryAgentsTable, (err) => {
    if (err) {
      console.error('Error creating delivery_agents table:', err.message);
    } else {
      console.log('✓ delivery_agents table created successfully');
    }
  });
  
  db.run(createDeliveryLocationsTable, (err) => {
    if (err) {
      console.error('Error creating delivery_locations table:', err.message);
    } else {
      console.log('✓ delivery_locations table created successfully');
    }
  });
  
  // Try to add delivery_agent_id column (it's okay if it already exists)
  db.run(addDeliveryAgentToOrders, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding delivery_agent_id column:', err.message);
    } else {
      console.log('✓ delivery_agent_id column added to orders table');
    }
  });
  
  // Create indexes
  createIndexes.forEach((indexSql, i) => {
    db.run(indexSql, (err) => {
      if (err) {
        console.error(`Error creating index ${i + 1}:`, err.message);
      } else {
        console.log(`✓ Index ${i + 1} created successfully`);
      }
    });
  });
  
  // Insert sample delivery agents
  const insertSampleAgents = `
    INSERT OR IGNORE INTO delivery_agents (name, phone, email, status)
    VALUES 
      ('John Doe', '+233555000001', 'john.doe@farumasi.com', 'active'),
      ('Jane Smith', '+233555000002', 'jane.smith@farumasi.com', 'active'),
      ('Michael Johnson', '+233555000003', 'michael.j@farumasi.com', 'active'),
      ('Sarah Wilson', '+233555000004', 'sarah.w@farumasi.com', 'active'),
      ('David Brown', '+233555000005', 'david.b@farumasi.com', 'active')
  `;
  
  db.run(insertSampleAgents, (err) => {
    if (err) {
      console.error('Error inserting sample delivery agents:', err.message);
    } else {
      console.log('✓ Sample delivery agents created');
    }
  });
  
  console.log('Delivery tracking tables setup complete!');
}

// Run the migration if this file is executed directly
if (require.main === module) {
  createDeliveryTables();
}

module.exports = { createDeliveryTables };
