const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../utils/fileUpload');

// Create product (with image)
router.post('/', upload.single('image'), productController.addProduct); //not well documented in README it misses uploading an image

// List products (with filters & pagination)
router.get('/', productController.listProducts); //not documented in readme

// Get a product by ID
router.get('/:id', productController.getProductById);

// Update product by ID
router.put('/:id', upload.single('image'), productController.updateProduct); //not documented in readme

// Delete product by ID
router.delete('/:id', productController.deleteProduct); //not documented in readme

module.exports = router;
