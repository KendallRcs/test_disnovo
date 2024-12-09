const express = require('express');
const localController = require('../controllers/local.controller');
const router = express.Router();

router.post('/', localController.createLocal);
router.get('/', localController.getLocals);
router.put('/:id', localController.updateLocal);
router.delete('/:id', localController.deleteLocal);
router.post('/import', localController.importLocalsFromExcel);

module.exports = router;
