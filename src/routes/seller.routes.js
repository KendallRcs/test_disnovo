const express = require('express');
const sellerController = require('../controllers/seller.controller');
const router = express.Router();

router.post('/', sellerController.createSeller);
router.get('/', sellerController.getSellers);
router.put('/:id', sellerController.updateSeller);
router.delete('/:id', sellerController.deleteSeller);

module.exports = router;
