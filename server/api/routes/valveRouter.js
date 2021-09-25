const express = require('express');
const router = express.Router();

const ValveController = require('../controllers/ValveController');

router.post('/toggleValve', ValveController.toggleValve);
router.get('/getValveState', ValveController.getValveState);
router.get('/', ValveController.getValveState);

module.exports = router;
