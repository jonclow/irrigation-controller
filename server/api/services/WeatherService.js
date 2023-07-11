const { Client } = require('pg');
const _ = require('lodash');
const STATION_ALT = 340;

const baseWx = async (client) => client.query(`
    SELECT dtg, rain, baro, air_temp, humid, solar, wind_mean, wind_high, wind_low
    FROM weather
    WHERE dtg > NOW() - INTERVAL '20 minute'
    ORDER BY dtg DESC
    LIMIT 1
  `);

const WeatherService = {
  convertAbsPressureToRel: function (p_abs, temp) {
    const alt_c = 0.0065 * STATION_ALT;
    const p_rel = p_abs * Math.pow((1 - alt_c / (temp + alt_c + 273.15)), -5.257);

    return Math.round(p_rel * 100) / 100;
  },

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
      ..._.pick(reading, ['rain', 'humid', 'solar']),
      baro: this.convertAbsPressureToRel(reading.baro, reading.airtemp),
      air_temp: reading.airtemp,
      wind_mean: reading.wsmean,
      wind_low: reading.wslow,
      wind_high: reading.wshigh
    };
  },

  getBasicWeather: async function (dbClient) {
    const client = dbClient || new Client();

    if (!dbClient) {
      await client.connect();
    }

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

    const { rows: basic } = await baseWx(client);

    if (!dbClient) {
      await client.end();
    }

    return {
      ...basic[0],
      ...rainfall1[0],
      ...rainfall24[0],
      baro: this.convertAbsPressureToRel(basic[0].baro, basic[0].air_temp)
    };
  },

  getDetailedWeather: async function () {
    // const { rows: max_wind } = await client.query(`
    //   SELECT dtg, wind_high
    //   FROM weather
    //   WHERE (wind_high ->> 'sp')::numeric = (SELECT MAX((wind_high ->> 'sp')::numeric) FROM weather)
    //   AND dtg >= NOW() - INTERVAL '24 hour'
    //   ORDER BY dtg DESC
    //   LIMIT 1
    // `)
    //
    // const { rows: min_wind } = await client.query(`
    //   SELECT dtg, wind_low
    //   FROM weather
    //   WHERE (wind_low ->> 'sp')::numeric = (SELECT MIN((wind_low ->> 'sp')::numeric) FROM weather)
    //   AND dtg >= NOW() - INTERVAL '24 hour'
    //   ORDER BY dtg DESC
    //   LIMIT 1
    // `)
    const client = new Client();
    await client.connect();

    const baseData = await this.getBasicWeather(client);

    const { rows: wind_data } = await client.query(`
      SELECT dtg, wind_mean
      FROM weather
      WHERE dtg >= NOW() - INTERVAL '24 hour'
      ORDER BY dtg ASC
    `)

    return {
      ...baseData[0],
      wind_data: _.map(wind_data, (data)  => ({
        dtg: `${data.dtg.substring(5,10)}-${data.dtg.substring(11,16)}`,
        ...data.wind_mean
      }))
    }
  }
}

module.exports = WeatherService;
