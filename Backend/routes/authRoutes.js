const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login); //not well documented in readme. login with cordinates is missing
router.put('/update-location', authMiddleware, authController.updateLocation); //not documented in readme

module.exports = router;
