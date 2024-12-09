const express = require('express');
const marketerController = require('../controllers/marketer.controller');
const router = express.Router();

router.post('/', marketerController.createMarketer);
router.get('/', marketerController.getMarketers);
router.put('/:id', marketerController.updateMarketer);
router.delete('/:id', marketerController.deleteMarketer);

module.exports = router;
