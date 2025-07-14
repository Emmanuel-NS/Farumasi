const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../middleware/auth');

// Get delivery agent location for specific order
router.get('/location/:orderId', deliveryController.getDeliveryAgentLocation);

// Update delivery agent location (for delivery agent mobile app)
router.put('/location/:orderId', deliveryController.updateDeliveryAgentLocation);

// Get all active deliveries (admin only)
router.get('/active', authMiddleware, deliveryController.getAllActiveDeliveries);

// Assign delivery agent to order (admin only)
router.put('/assign/:orderId', authMiddleware, deliveryController.assignDeliveryAgent);

// Get delivery agent profile
router.get('/agent/:agentId', deliveryController.getDeliveryAgent);

// Create delivery agent (admin only)
router.post('/agent', authMiddleware, deliveryController.createDeliveryAgent);

module.exports = router;
