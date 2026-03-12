const express = require('express');
const router = express.Router();
const IAQController = require('../controllers/IAQController');

router.post('/setIAQ', IAQController.setIAQ);

module.exports = router;
