const express = require('express');
const brandController = require('../controllers/brand.controller');
const router = express.Router();

router.post('/', brandController.createBrand);
router.get('/', brandController.getBrands);
router.put('/:id', brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);

module.exports = router;
