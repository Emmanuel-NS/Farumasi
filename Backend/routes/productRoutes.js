const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../utils/fileUpload');

// Create product (with image)
router.post('/', upload.single('image'), productController.addProduct); 

// List products (with filters & pagination)
router.get('/', productController.listProducts); 

// Get a product by ID
router.get('/:id', productController.getProductById);

// Update product by ID
router.put('/:id', upload.single('image'), productController.updateProduct); 

// Delete product by ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;
