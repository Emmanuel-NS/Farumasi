const db = require('../models/db');

// Get delivery agent location for a specific order
exports.getDeliveryAgentLocation = (req, res) => {
  const { orderId } = req.params;
  
  const sql = `
    SELECT 
      dl.*,
      da.name as agent_name,
      da.phone,
      da.email
    FROM delivery_locations dl
    JOIN delivery_agents da ON dl.agent_id = da.id
    WHERE dl.order_id = ?
    ORDER BY dl.updated_at DESC
    LIMIT 1
  `;
  
  db.get(sql, [orderId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Delivery agent location not found' });
    }
    
    res.json({
      latitude: row.latitude,
      longitude: row.longitude,
      agent_name: row.agent_name,
      phone: row.phone,
      updated_at: row.updated_at,
      accuracy: row.accuracy,
      speed: row.speed,
      heading: row.heading
    });
  });
};

// Update delivery agent location (for delivery agent app)
exports.updateDeliveryAgentLocation = (req, res) => {
  const { orderId } = req.params;
  const { latitude, longitude, accuracy, speed, heading, agent_id } = req.body;
  
  if (!latitude || !longitude || !agent_id) {
    return res.status(400).json({ error: 'Missing required location data' });
  }
  
  const sql = `
    INSERT OR REPLACE INTO delivery_locations 
    (order_id, agent_id, latitude, longitude, accuracy, speed, heading, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `;
  
  db.run(sql, [orderId, agent_id, latitude, longitude, accuracy, speed, heading], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({
      message: 'Location updated successfully',
      location_id: this.lastID,
      timestamp: new Date().toISOString()
    });
  });
};

// Get all active delivery locations (for admin dashboard)
exports.getAllActiveDeliveries = (req, res) => {
  const sql = `
    SELECT 
      dl.*,
      da.name as agent_name,
      da.phone,
      o.id as order_id,
      o.status,
      u.name as customer_name,
      p.name as pharmacy_name
    FROM delivery_locations dl
    JOIN delivery_agents da ON dl.agent_id = da.id
    JOIN orders o ON dl.order_id = o.id
    JOIN users u ON o.user_id = u.id
    JOIN pharmacies p ON o.pharmacy_id = p.id
    WHERE o.status IN ('shipped', 'out_for_delivery')
    AND dl.updated_at > datetime('now', '-1 hour')
    ORDER BY dl.updated_at DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json(rows);
  });
};

// Assign delivery agent to order
exports.assignDeliveryAgent = (req, res) => {
  const { orderId } = req.params;
  const { agent_id } = req.body;
  
  if (!agent_id) {
    return res.status(400).json({ error: 'Agent ID is required' });
  }
  
  // Update order with assigned agent
  const updateOrderSql = `UPDATE orders SET delivery_agent_id = ? WHERE id = ?`;
  
  db.run(updateOrderSql, [agent_id, orderId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({
      message: 'Delivery agent assigned successfully',
      order_id: orderId,
      agent_id: agent_id
    });
  });
};

// Get delivery agent profile
exports.getDeliveryAgent = (req, res) => {
  const { agentId } = req.params;
  
  const sql = `
    SELECT id, name, phone, email, status, created_at
    FROM delivery_agents 
    WHERE id = ?
  `;
  
  db.get(sql, [agentId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Delivery agent not found' });
    }
    
    res.json(row);
  });
};

// Create delivery agent (admin only)
exports.createDeliveryAgent = (req, res) => {
  const { name, phone, email } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  
  const sql = `
    INSERT INTO delivery_agents (name, phone, email, status, created_at)
    VALUES (?, ?, ?, 'active', datetime('now'))
  `;
  
  db.run(sql, [name, phone, email], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({
      message: 'Delivery agent created successfully',
      agent_id: this.lastID,
      name: name,
      phone: phone
    });
  });
};
