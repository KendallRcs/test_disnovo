const express = require('express');
const assignmentController = require('../controllers/sellerTerritoryAssignment.controller');
const router = express.Router();

router.post('/', assignmentController.createAssignment);
router.get('/', assignmentController.getAssignments);
router.put('/:id', assignmentController.updateAssignment);
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;
