const express = require('express');
const router = express.Router();

const WeatherController = require('../controllers/WeatherController');

router.get('/getBasicWeather', WeatherController.getBasicWeather);
router.get('/', WeatherController.getBasicWeather);

module.exports = router;