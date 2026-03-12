const express = require('express');
const router = express.Router();
const IAQController = require('../controllers/IAQController');

router.post('/setIAQ', IAQController.setIAQ);
router.get('/getLatestIAQ', IAQController.getLatestIAQ);
router.get('/getIAQHistory', IAQController.getIAQHistory);

module.exports = router;
