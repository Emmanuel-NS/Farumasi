const db = require('../models/db');
const { haversineDistance } = require('../utils/distanceCalculator');
const { calculateDeliveryFee } = require('../utils/deliveryFee');

const insuranceDiscounts = {
  'RSSB': 0.20,
  'MUTUELLE': 0.10,
  'NONE': 0
};

// Helper: check if pharmacy has all requested products
function pharmacyHasAllProducts(pharmacyId, items) {
  return new Promise((resolve, reject) => {
    let matched = 0;
    if (!Array.isArray(items) || items.length === 0) return resolve(true);

    items.forEach(item => {
      const sql = 'SELECT * FROM products WHERE id = ? AND pharmacy_id = ?';
      db.get(sql, [item.product_id, pharmacyId], (err, row) => {
        if (err) return reject(err);
        if (row) matched++;
        else return resolve(false);
        if (matched === items.length) resolve(true);
      });
    });
  });
}

// 📦 Place order
exports.placeOrder = async (req, res) => {
  const user_id = req.user.id;
  let items = req.body.items || '[]';
  const insurance_provider = req.body.insurance_provider || 'NONE';
  const prescription_file = req.file ? req.file.filename : null;

  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch (_) {
      return res.status(400).json({ error: 'Invalid items format' });
    }
  }

  const hasItems = Array.isArray(items) && items.length > 0;
  const hasPrescription = !!prescription_file;

  // ❌ Invalid: both prescription and items
  if (hasItems && hasPrescription) {
    return res.status(400).json({
      error: 'Cannot provide both prescription file and list of items. Choose one.'
    });
  }

  // ❌ Invalid: neither provided
  if (!hasItems && !hasPrescription) {
    return res.status(400).json({
      error: 'Either prescription file or list of items is required.'
    });
  }

  // ✅ Case: Prescription only
  if (hasPrescription && !hasItems) {
    const insertSQL = `
      INSERT INTO orders (user_id, prescription_file, status)
      VALUES (?, ?, 'pending_prescription_review')
    `;
    db.run(insertSQL, [user_id, prescription_file], function (err) {
      if (err) {
        console.error('[Prescription Order Error]', err);
        return res.status(500).json({ error: 'Failed to place prescription order' });
      }

      return res.status(201).json({
        message: 'Prescription uploaded successfully. Order is under review.',
        order_id: this.lastID
      });
    });
    return;
  }

  // ✅ Case: Items only
  try {
    // Get user with location
    const user = await new Promise((resolve, reject) => {
      const sql = `
        SELECT u.*, l.latitude AS user_lat, l.longitude AS user_long
        FROM users u
        LEFT JOIN locations l ON u.id = l.user_id
        WHERE u.id = ?
      `;
      db.get(sql, [user_id], (err, row) => {
        if (err || !row) reject(new Error('User not found or missing location'));
        else resolve(row);
      });
    });

    // Get all pharmacies with locations
    const pharmacies = await new Promise((resolve, reject) => {
      const sql = `
        SELECT p.*, l.latitude AS pharm_lat, l.longitude AS pharm_long
        FROM pharmacies p
        LEFT JOIN locations l ON p.id = l.pharmacy_id
      `;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Filter eligible pharmacies
    const eligible = [];

    for (const pharm of pharmacies) {
      if (
        pharm.pharm_lat == null || pharm.pharm_long == null ||
        user.user_lat == null || user.user_long == null
      ) continue;

      let acceptedInsurances = [];
      try {
        acceptedInsurances = JSON.parse(pharm.insurance_accepted || '[]');
      } catch (_) {}

      const accepts = insurance_provider === 'NONE' || acceptedInsurances.includes(insurance_provider);
      if (!accepts) continue;

      const hasProducts = await pharmacyHasAllProducts(pharm.id, items);
      if (!hasProducts) continue;

      const distance = haversineDistance(user.user_lat, user.user_long, pharm.pharm_lat, pharm.pharm_long);
      eligible.push({ ...pharm, distance });
    }

    if (!eligible.length) {
      return res.status(404).json({ error: 'No pharmacy meets the requirements' });
    }

    const nearest = eligible.reduce((a, b) => a.distance < b.distance ? a : b);

    // Fetch product details and validate prescription requirement
    const productMap = {};
    let prescriptionRequired = false;

    for (const item of items) {
      const product = await new Promise((resolve, reject) => {
        db.get(
          'SELECT price, requires_prescription FROM products WHERE id = ? AND pharmacy_id = ?',
          [item.product_id, nearest.id],
          (err, row) => {
            if (err) reject(err);
            else if (!row) reject(new Error(`Product ${item.product_id} not found in pharmacy`));
            else resolve(row);
          }
        );
      });

      productMap[item.product_id] = {
        price: product.price,
        requires_prescription: product.requires_prescription === 1
      };

      if (product.requires_prescription === 1) {
        prescriptionRequired = true;
      }
    }

    // Require prescription file if any selected product needs it
    if (prescriptionRequired && !prescription_file) {
      return res.status(400).json({
        error: 'Prescription file is required for one or more selected products'
      });
    }

    // Calculate totals
    const delivery_fee = calculateDeliveryFee(nearest.distance);
    const subtotal = items.reduce((sum, i) => sum + (productMap[i.product_id].price * i.quantity), 0);
    const discount = insuranceDiscounts[insurance_provider] || 0;
    const total = subtotal * (1 - discount);

    // Insert order
    const insertOrderSQL = `
      INSERT INTO orders (user_id, pharmacy_id, total_price, delivery_fee, prescription_file, insurance_provider, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `;
    db.run(insertOrderSQL, [user_id, nearest.id, total, delivery_fee, prescription_file, insurance_provider], function (err) {
      if (err) return res.status(500).json({ error: 'Failed to insert order' });

      const orderId = this.lastID;

      const insertItems = items.map(item => {
        const { price } = productMap[item.product_id];
        return new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [orderId, item.product_id, item.quantity, price],
            err => err ? reject(err) : resolve()
          );
        });
      });

      Promise.all(insertItems)
        .then(() => {
          res.status(201).json({
            message: 'Order placed successfully',
            order_id: orderId,
            pharmacy_id: nearest.id,
            delivery_fee,
            total_price: total,
            discount_rate: discount,
            pharmacy: {
              id: nearest.id,
              name: nearest.name,
              distance: nearest.distance
            }
          });
        })
        .catch(err => res.status(500).json({ error: 'Failed to insert order items' }));
    });

  } catch (error) {
    console.error('[Order Error]', error);
    res.status(500).json({ error: error.message });
  }
};

// Get order details by ID
exports.getOrderById = (req, res) => {
  const orderId = req.params.id;
  const sqlOrder = `
    SELECT o.*, u.name as user_name, p.name as pharmacy_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN pharmacies p ON o.pharmacy_id = p.id
    WHERE o.id = ?
  `;
  db.get(sqlOrder, [orderId], (err, order) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const sqlItems = `SELECT * FROM order_items WHERE order_id = ?`;
    db.all(sqlItems, [orderId], (err, items) => {
      if (err) return res.status(500).json({ error: err.message });

      order.items = items;
      res.json(order);
    });
  });
};

// Get all orders for a user
exports.getOrdersByUser = (req, res) => {
  const userId = req.params.user_id;
  const sql = `
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `;
  db.all(sql, [userId], (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(orders);
  });
};
// Get all orders (general route)
exports.getAllOrders = (req, res) => { 
  // filter by status if provided
  const status = req.query.status;  
  let sql = `
    SELECT o.*, u.name as user_name, p.name as pharmacy_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN pharmacies p ON o.pharmacy_id = p.id
  `;
  if (status) {
    sql += ` WHERE o.status = ?`;
  }
  sql += ` ORDER BY o.created_at DESC`;
  const params = status ? [status] : [];
  // Execute query
  db.all(sql, params, (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(orders);
  }
  );
}
  
// Get all orders for a pharmacy
exports.getOrdersForPharmacy = (req, res) => {
  const pharmacyId = req.params.pharmacy_id;
  const sql = `
    SELECT * FROM orders WHERE pharmacy_id = ? ORDER BY created_at DESC
  `;
  db.all(sql, [pharmacyId], (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(orders);
  });
};

// Update order status
exports.updateOrderStatus = (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  //example of the body: { "status": "approved" }

  const validStatuses = ['pending', 'approved', 'shipped', 'delivered', 'canceled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const sql = `UPDATE orders SET status = ? WHERE id = ?`;
  db.run(sql, [status, orderId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });

    res.json({ message: `Order status updated to ${status}` });
  });
};

// Delete order (only if pending or canceled)
exports.deleteOrder = (req, res) => {
  const orderId = req.params.id;

  // First check order status
  db.get('SELECT status FROM orders WHERE id = ?', [orderId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Order not found' });

    if (!['pending', 'canceled'].includes(row.status)) {
      return res.status(400).json({ error: 'Only pending or canceled orders can be deleted' });
    }

    // Delete order items first
    db.run('DELETE FROM order_items WHERE order_id = ?', [orderId], function(err) {
      if (err) return res.status(500).json({ error: err.message });

      // Then delete the order
      db.run('DELETE FROM orders WHERE id = ?', [orderId], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: 'Order deleted successfully' });
      });
    });
  });
};

// 🔄 Update prescription-based order after admin review
exports.updatePrescriptionOrderDetails = async (req, res) => {
  const { order_id, insurance_provider = 'NONE', items, status = 'pending' } = req.body;

  const insuranceDiscounts = {
    'RSSB': 0.20,
    'MUTUELLE': 0.10,
    'NONE': 0
  };

  if (!order_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'order_id and valid items are required' });
  }

  try {
    // 1. Get existing order
    const existingOrder = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [order_id], (err, row) => {
        if (err) reject(err);
        else if (!row) reject(new Error('Order not found'));
        else resolve(row);
      });
    });

    const user_id = existingOrder.user_id;

    // 2. Get user + location
    const user = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.*, l.latitude AS user_lat, l.longitude AS user_long
        FROM users u
        LEFT JOIN locations l ON u.id = l.user_id
        WHERE u.id = ?
      `, [user_id], (err, row) => {
        if (err || !row) reject(new Error('User location not found'));
        else resolve(row);
      });
    });

    // 3. Get all pharmacies with locations
    const pharmacies = await new Promise((resolve, reject) => {
      db.all(`
        SELECT p.*, l.latitude AS pharm_lat, l.longitude AS pharm_long
        FROM pharmacies p
        LEFT JOIN locations l ON p.id = l.pharmacy_id
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // 4. Filter eligible pharmacies
    const eligible = [];
    for (const pharm of pharmacies) {
      if (!pharm.pharm_lat || !pharm.pharm_long || !user.user_lat || !user.user_long) continue;

      let acceptedInsurances = [];
      try {
        acceptedInsurances = JSON.parse(pharm.insurance_accepted || '[]');
      } catch (_) {}

      const accepts = insurance_provider === 'NONE' || acceptedInsurances.includes(insurance_provider);
      if (!accepts) continue;

      const hasAll = await Promise.all(items.map(item =>
        new Promise((resolve, reject) => {
          db.get('SELECT * FROM products WHERE id = ? AND pharmacy_id = ?', [item.product_id, pharm.id], (err, row) => {
            if (err) reject(err);
            else resolve(!!row);
          });
        })
      ));

      if (hasAll.every(Boolean)) {
        const distance = haversineDistance(user.user_lat, user.user_long, pharm.pharm_lat, pharm.pharm_long);
        eligible.push({ ...pharm, distance });
      }
    }

    if (!eligible.length) {
      return res.status(400).json({ error: 'No suitable pharmacy found for items and insurance' });
    }

    const nearest = eligible.reduce((a, b) => a.distance < b.distance ? a : b);

    // 5. Get prices from nearest pharmacy
    const productMap = {};
    for (const item of items) {
      const product = await new Promise((resolve, reject) => {
        db.get('SELECT price FROM products WHERE id = ? AND pharmacy_id = ?', [item.product_id, nearest.id], (err, row) => {
          if (err) reject(err);
          else if (!row) reject(new Error(`Product ${item.product_id} not found in pharmacy`));
          else resolve(row);
        });
      });
      productMap[item.product_id] = product.price;
    }

    const subtotal = items.reduce((sum, i) => sum + (productMap[i.product_id] * i.quantity), 0);
    const discountRate = insuranceDiscounts[insurance_provider] || 0;
    const discountedTotal = subtotal * (1 - discountRate);
    const delivery_fee = calculateDeliveryFee(nearest.distance);

    // 6. Clear old items
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM order_items WHERE order_id = ?', [order_id], err => err ? reject(err) : resolve());
    });

    // 7. Insert new items
    await Promise.all(items.map(item => {
      const price = productMap[item.product_id];
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [order_id, item.product_id, item.quantity, price],
          err => err ? reject(err) : resolve()
        );
      });
    }));

    // 8. Update order
    db.run(`
      UPDATE orders SET
        pharmacy_id = ?,
        total_price = ?,
        delivery_fee = ?,
        insurance_provider = ?,
        status = ?
      WHERE id = ?
    `, [nearest.id, discountedTotal, delivery_fee, insurance_provider, status, order_id], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to update order' });

      res.json({
        message: 'Order updated successfully after prescription review',
        order_id,
        total_price: discountedTotal,
        discount_rate: discountRate,
        delivery_fee,
        pharmacy: {
          id: nearest.id,
          name: nearest.name,
          distance: nearest.distance
        }
      });
    });

  } catch (error) {
    console.error('[Admin Update Error]', error);
    res.status(500).json({ error: error.message });
  }
};
