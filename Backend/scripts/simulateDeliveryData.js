const db = require('../models/db');

// Simulate real-time delivery agent locations for testing
function simulateDeliveryLocations() {
  console.log('Simulating delivery agent locations...');
  
  // First, let's get some orders that are shipped or out for delivery
  const getActiveOrdersSql = `
    SELECT id, status FROM orders 
    WHERE status IN ('shipped', 'out_for_delivery')
    LIMIT 5
  `;
  
  db.all(getActiveOrdersSql, [], (err, orders) => {
    if (err) {
      console.error('Error fetching orders:', err.message);
      return;
    }
    
    if (orders.length === 0) {
      console.log('No active delivery orders found. Creating sample orders...');
      createSampleOrders();
      return;
    }
    
    console.log(`Found ${orders.length} active delivery orders`);
    
    // Get delivery agents
    db.all('SELECT id, name FROM delivery_agents WHERE status = "active" LIMIT 5', [], (err, agents) => {
      if (err) {
        console.error('Error fetching agents:', err.message);
        return;
      }
      
      // Ghana coordinates (Accra area)
      const accraLocations = [
        { lat: 5.6037, lng: -0.1870, name: "Accra Central" },
        { lat: 5.5560, lng: -0.2057, name: "Tema" },
        { lat: 5.6500, lng: -0.1000, name: "East Legon" },
        { lat: 5.5600, lng: -0.2400, name: "Kaneshie" },
        { lat: 5.6200, lng: -0.1600, name: "Osu" },
        { lat: 5.5800, lng: -0.2200, name: "Dansoman" },
      ];
      
      // Assign agents to orders and create location data
      orders.forEach((order, index) => {
        const agent = agents[index % agents.length];
        const baseLocation = accraLocations[index % accraLocations.length];
        
        // Add some random variation to make it realistic
        const latitude = baseLocation.lat + (Math.random() - 0.5) * 0.01;
        const longitude = baseLocation.lng + (Math.random() - 0.5) * 0.01;
        const accuracy = Math.random() * 10 + 5; // 5-15 meters
        const speed = Math.random() * 30 + 10; // 10-40 km/h
        const heading = Math.random() * 360; // 0-360 degrees
        
        // Assign agent to order
        const assignAgentSql = `UPDATE orders SET delivery_agent_id = ? WHERE id = ?`;
        db.run(assignAgentSql, [agent.id, order.id], (err) => {
          if (err) {
            console.error(`Error assigning agent ${agent.id} to order ${order.id}:`, err.message);
          } else {
            console.log(`✓ Assigned ${agent.name} to order #${order.id}`);
          }
        });
        
        // Create location record
        const createLocationSql = `
          INSERT OR REPLACE INTO delivery_locations 
          (order_id, agent_id, latitude, longitude, accuracy, speed, heading, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `;
        
        db.run(createLocationSql, [order.id, agent.id, latitude, longitude, accuracy, speed, heading], (err) => {
          if (err) {
            console.error(`Error creating location for order ${order.id}:`, err.message);
          } else {
            console.log(`✓ Created location for order #${order.id} at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        });
      });
    });
  });
}

function createSampleOrders() {
  console.log('Creating sample delivery orders...');
  
  // First get a user and pharmacy
  db.get('SELECT id FROM users LIMIT 1', [], (err, user) => {
    if (err || !user) {
      console.error('No users found. Please create a user first.');
      return;
    }
    
    db.get('SELECT id FROM pharmacies LIMIT 1', [], (err, pharmacy) => {
      if (err || !pharmacy) {
        console.error('No pharmacies found. Please create a pharmacy first.');
        return;
      }
      
      // Create sample orders
      const sampleOrders = [
        { status: 'shipped', total: 250.00 },
        { status: 'out_for_delivery', total: 180.50 },
        { status: 'shipped', total: 320.75 }
      ];
      
      sampleOrders.forEach((orderData, index) => {
        const createOrderSql = `
          INSERT INTO orders (user_id, pharmacy_id, total_price, delivery_fee, status, created_at)
          VALUES (?, ?, ?, 25.00, ?, datetime('now'))
        `;
        
        db.run(createOrderSql, [user.id, pharmacy.id, orderData.total, orderData.status], function(err) {
          if (err) {
            console.error(`Error creating sample order ${index + 1}:`, err.message);
          } else {
            console.log(`✓ Created sample order #${this.lastID} with status: ${orderData.status}`);
            
            if (index === sampleOrders.length - 1) {
              // After creating all orders, simulate locations
              setTimeout(() => simulateDeliveryLocations(), 1000);
            }
          }
        });
      });
    });
  });
}

// Run simulation if this file is executed directly
if (require.main === module) {
  simulateDeliveryLocations();
}

module.exports = { simulateDeliveryLocations };
