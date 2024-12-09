const express = require('express');
const saleController = require('../controllers/sale.controller');
const router = express.Router();

router.post('/', saleController.createSale);
router.get('/', saleController.getSales);
router.put('/:id', saleController.updateSale);
router.delete('/:id', saleController.deleteSale);

module.exports = router;
