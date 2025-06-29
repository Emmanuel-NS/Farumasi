const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const upload = require('../utils/fileUpload');

// Place a new order (with file upload) 
router.post('/', upload.single('prescription_file'), orderController.placeOrder);

// Get all orders (general route, first)
router.get('/', orderController.getAllOrders);

// Get all orders for a user (put before /:id)
router.get('/user/:user_id', orderController.getOrdersByUser);

// Get all orders for a pharmacy (put before /:id)
router.get('/pharmacy/:pharmacy_id', orderController.getOrdersForPharmacy);

// Get order details by ID (general route, last)
router.get('/:id', orderController.getOrderById);

// Update order status
router.put('/:id/status', orderController.updateOrderStatus);

// Update order details
router.put('/prescription-review', orderController.updatePrescriptionOrderDetails);

// Delete order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
