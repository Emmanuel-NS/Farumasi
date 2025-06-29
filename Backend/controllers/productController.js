const db = require('../models/db');
const path = require('path');

// 🔧 Add a new product
exports.addProduct = (req, res) => {
  let {
    name,
    description,
    category,
    price,
    requires_prescription,
    pharmacy_id
  } = req.body;

  const image = req.file ? req.file.filename : null;

  // Validate required fields
  if (!name || !price || !pharmacy_id) {
    return res.status(400).json({ error: 'Name, price, and pharmacy ID are required' });
  }

  price = parseFloat(price);
  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }

  name = name.trim();
  description = description ? description.trim() : '';
  category = category ? category.trim() : '';

  // Normalize requires_prescription
  const normalizedPrescription = (requires_prescription === true || requires_prescription === 'true') ? 1 : 0;

  db.get('SELECT id FROM pharmacies WHERE id = ?', [pharmacy_id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Pharmacy not found' });

    const sql = `
      INSERT INTO products 
      (name, description, category, price, requires_prescription, image, pharmacy_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [
      name,
      description,
      category,
      price,
      normalizedPrescription,
      image,
      pharmacy_id
    ], function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ message: 'Product added', productId: this.lastID });
    });
  });
};

// 📦 List all products (filters + pagination)
exports.listProducts = (req, res) => {
  const { category, search, requires_prescription, limit = 20, offset = 0 } = req.query;

  let sql = `
    SELECT 
      p.*, 
      ph.name AS pharmacy_name 
    FROM products p 
    JOIN pharmacies ph ON p.pharmacy_id = ph.id
  `;
  const params = [];
  const conditions = [];

  if (category) {
    conditions.push('p.category = ?');
    params.push(category.trim());
  }
  if (requires_prescription !== undefined) {
    conditions.push('p.requires_prescription = ?');
    params.push(requires_prescription === 'true' ? 1 : 0);
  }
  if (search) {
    conditions.push('p.name LIKE ?');
    params.push(`%${search.trim()}%`);
  }

  if (conditions.length) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const products = rows.map(product => ({
      ...product,
      image_url: product.image
        ? `${req.protocol}://${req.get('host')}/uploads/${product.image}`
        : null
    }));

    res.json({
      count: products.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: products
    });
  });
};

// 🔍 Get product by ID
exports.getProductById = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.*, ph.name AS pharmacy_name 
    FROM products p 
    JOIN pharmacies ph ON p.pharmacy_id = ph.id 
    WHERE p.id = ?
  `;
  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Product not found' });

    const product = {
      ...row,
      image_url: row.image
        ? `${req.protocol}://${req.get('host')}/uploads/${row.image}`
        : null
    };

    res.json(product);
  });
};

// ✏️ Update product
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, requires_prescription } = req.body;

  const sql = `
    UPDATE products
    SET name = ?, description = ?, category = ?, price = ?, requires_prescription = ?
    WHERE id = ?
  `;

  db.run(sql, [
    name?.trim(),
    description?.trim(),
    category?.trim(),
    parseFloat(price),
    (requires_prescription === true || requires_prescription === 'true') ? 1 : 0,
    id
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Product not found or unchanged' });
    res.json({ message: 'Product updated' });
  });
};

// ❌ Delete product
exports.deleteProduct = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM products WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  });
};
