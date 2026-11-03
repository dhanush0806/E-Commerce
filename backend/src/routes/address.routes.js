const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', addressController.getUserAddresses);
router.post('/', addressController.addAddress);
router.delete('/:id', addressController.deleteAddress);

module.exports = router;
