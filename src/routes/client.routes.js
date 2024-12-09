const express = require('express');
const clientController = require('../controllers/client.controller');
const router = express.Router();

router.post('/', clientController.createClient);
router.get('/', clientController.getClients);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

module.exports = router;
