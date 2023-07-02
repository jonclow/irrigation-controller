

const WeatherService = {
  addWeatherReading: async function (wx) {
    const reading = JSON.parse(wx);
    console.log('----------- Weather Reading:  ', reading);
    const { Client } = require('pg');
    const client = new Client();
    await client.connect();
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

    console.log('----------- Weather Reading Written To Database ');

    await client.end();
  }
}

module.exports = WeatherService;
