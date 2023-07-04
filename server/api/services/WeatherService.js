const { Client } = require('pg');
const _ = require('lodash');

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

    return {
      ..._.pick(reading, ['rain', 'baro', 'humid', 'solar']),
      air_temp: reading.airtemp,
      wind_mean: reading.wsmean
    };
  },

  getBasicWeather: async function () {
    const client = new Client();
    await client.connect();

    const { rows: rainfall1 } = await client.query(`
      SELECT SUM (rain) AS rain1
      FROM weather
      WHERE dtg >= NOW() - INTERVAL '1 hour'
    `)

    const { rows: rainfall24 } = await client.query(`
      SELECT SUM (rain) AS rain24
      FROM weather 
      WHERE dtg >= NOW() - INTERVAL '24 hour'
    `)

    const { rows: max_wind } = await client.query(`
      SELECT dtg, wind_high 
      FROM weather 
      WHERE (wind_high ->> 'sp')::numeric = (SELECT MAX((wind_high ->> 'sp')::numeric) FROM weather) 
      AND dtg >= NOW() - INTERVAL '24 hour'
      ORDER BY dtg DESC
      LIMIT 1
    `)

    const { rows: min_wind } = await client.query(`
      SELECT dtg, wind_low 
      FROM weather 
      WHERE (wind_low ->> 'sp')::numeric = (SELECT MIN((wind_low ->> 'sp')::numeric) FROM weather) 
      AND dtg >= NOW() - INTERVAL '24 hour'
      ORDER BY dtg DESC
      LIMIT 1
    `)

    const { rows: basic } = await client.query(`
      SELECT dtg, rain, baro, air_temp, humid, solar, wind_mean, wind_high, wind_low
      FROM weather
      WHERE dtg > NOW() - INTERVAL '20 minute'
      ORDER BY dtg DESC
      LIMIT 1
    `);

    await client.end();

    return {
      ...rainfall1[0],
      ...rainfall24[0],
      minwind24: {
        ...min_wind[0],
      },
      maxwind24: {
        ...max_wind[0],
      },
      ...basic[0]
    };
  }
}

module.exports = WeatherService;
