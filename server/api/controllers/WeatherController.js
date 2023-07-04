const WeatherService = require('../services/WeatherService');

exports.getBasicWeather = async function (req, res) {
  const weather_data = await WeatherService.getBasicWeather();
  return res.send(weather_data);
}
