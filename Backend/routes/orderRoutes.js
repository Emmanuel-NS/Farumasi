const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const upload = require('../utils/fileUpload');
const authMiddleware = require('../middleware/auth');

// Place a new order (with file upload) 
router.post('/',authMiddleware, upload.single('prescription_file'), orderController.placeOrder); //pooly documented. nt json data it should be form-data

// Get all orders (general route, first)
router.get('/', orderController.getAllOrders);//not well documented. it excludes orders with status 'pending_prescription_review'

// Get all orders for a user (put before /:id)
router.get('/user/:user_id', orderController.getOrdersByUser); //not documented

// Get all orders for a pharmacy (put before /:id)
router.get('/pharmacy/:pharmacy_id', orderController.getOrdersForPharmacy);//not documented

// Get order details by ID (general route, last)
router.get('/:id', orderController.getOrderById);//not well documented. it excludes orders with status 'pending_prescription_review'

// Update order status
router.put('/:id/status', orderController.updateOrderStatus);

// Update order details
router.put('/prescription-review', orderController.updatePrescriptionOrderDetails); //not documented

// Delete order
router.delete('/:id', orderController.deleteOrder); ///not documented

module.exports = router;
