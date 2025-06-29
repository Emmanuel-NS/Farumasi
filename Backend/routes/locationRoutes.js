const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// For user
router.put('/update/user/:userId', locationController.updateLocationByUserId);
router.get('/user/:userId', locationController.getLocationByUserId);

// For pharmacy
router.put('/update/pharmacy/:pharmacyId', locationController.updateLocationByPharmacyId);
router.get('/pharmacy/:pharmacyId', locationController.getLocationByPharmacyId);

// All
router.get('/', locationController.getAllLocations);



module.exports = router;
