const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login); 
router.put('/update-location', authMiddleware, authController.updateLocation); 

module.exports = router;
