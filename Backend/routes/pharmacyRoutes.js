const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');

router.post('/', pharmacyController.registerPharmacy);
router.get('/', pharmacyController.getAllPharmacies); 
router.put('/:id', pharmacyController.updatePharmacy); 
router.get('/:id', pharmacyController.getPharmacyById); 

module.exports = router;
