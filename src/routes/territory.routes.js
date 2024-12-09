const express = require('express');
const territoryController = require('../controllers/territory.controller');
const router = express.Router();

router.post('/', territoryController.createTerritory);
router.get('/', territoryController.getTerritories);
router.put('/:id', territoryController.updateTerritory);
router.delete('/:id', territoryController.deleteTerritory);

module.exports = router;
