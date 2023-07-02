const { Client } = require('pg');

const WeatherService = {
  addWeatherReading: async function (wx) {
    const client = new Client();
    await client.connect();

    const reading = JSON.parse(wx);

    await client.query(`
      INSERT INTO weather(dtg, rain, baro, air_temp, humid, solar, wind_low, wind_high, wind_mean)
      VALUES(CURRENT_TIMESTAMP, $1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      reading.rain,
      reading.baro,
      reading.airtemp,
      reading.humid,
      reading.solar,
      reading.wslow,
      reading.wshigh,
      reading.wsmean
    ]);

    await client.end();
  }
}

module.exports = WeatherService;
