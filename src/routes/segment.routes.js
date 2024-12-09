const express = require('express');
const segmentController = require('../controllers/segment.controller');
const router = express.Router();

router.post('/', segmentController.createSegment);
router.get('/', segmentController.getSegments);
router.put('/:id', segmentController.updateSegment);
router.delete('/:id', segmentController.deleteSegment);

module.exports = router;
