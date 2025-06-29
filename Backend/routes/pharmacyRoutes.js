const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');

router.post('/', pharmacyController.registerPharmacy);
router.get('/', pharmacyController.getAllPharmacies); //not documented in README
router.put('/:id', pharmacyController.updatePharmacy); //not documented in README
router.get('/:id', pharmacyController.getPharmacyById); 

module.exports = router;
