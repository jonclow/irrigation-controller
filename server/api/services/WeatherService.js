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

    const [
      { rows: rainfall1 },
      { rows: rainfall24 },
      { rows: rainfall48 },
      { rows: rainfallWeek },
      { rows: basic }
    ] = await Promise.all([
      client.query(`
        SELECT ROUND(SUM(rain)::numeric, 1) AS rain1
        FROM weather
        WHERE dtg >= NOW() - INTERVAL '1 hour'
      `),
      client.query(`
        SELECT ROUND(SUM(rain)::numeric, 1) AS rain24
        FROM weather 
        WHERE dtg >= NOW() - INTERVAL '24 hour'
      `),
      client.query(`
        SELECT ROUND(SUM(rain)::numeric, 1) AS rain48
        FROM weather 
        WHERE dtg >= NOW() - INTERVAL '48 hour'
      `),
      client.query(`
        SELECT ROUND(SUM(rain)::numeric, 1) AS rainWeek
        FROM weather 
        WHERE dtg >= NOW() - INTERVAL '1 week'
      `),
      baseWx(client)
    ])

    if (!dbClient) {
      await client.end();
    }

    return {
      ...basic[0],
      ...rainfall1[0],
      ...rainfall24[0],
      ...rainfall48[0],
      ...rainfallWeek[0],
      baro: this.convertAbsPressureToRel(basic[0].baro, basic[0].air_temp)
    };
  },

  getDetailedWeather: async function () {
    const client = new Client();
    await client.connect();

    const [
      baseData,
      { rows: max_wind },
      { rows: min_wind }
    ] = await Promise.all([
      this.getBasicWeather(client),
      client.query(`
        SELECT dtg, TO_CHAR(dtg AT TIME ZONE 'pacific/auckland', 'MON-DD HH24:MI') date_time, wind_high
        FROM weather
        WHERE (wind_high ->> 'sp')::numeric = (SELECT MAX((wind_high ->> 'sp')::numeric) FROM weather WHERE dtg >= NOW() - INTERVAL '24 hour')
        AND dtg >= NOW() - INTERVAL '24 hour'
        ORDER BY dtg DESC
        LIMIT 1
      `),
      client.query(`
        SELECT dtg, TO_CHAR(dtg AT TIME ZONE 'pacific/auckland', 'MON-DD HH24:MI') date_time, wind_low
        FROM weather
        WHERE (wind_low ->> 'sp')::numeric = (SELECT MIN((wind_low ->> 'sp')::numeric) FROM weather WHERE dtg >= NOW() - INTERVAL '24 hour')
        AND dtg >= NOW() - INTERVAL '24 hour'
        ORDER BY dtg DESC
        LIMIT 1
      `)
    ]);

    await client.end();

    return {
      ...baseData,
      max_wind_24: {
        date_time: max_wind[0].date_time,
        ...max_wind[0].wind_high
      },
      min_wind_24: {
        date_time: min_wind[0].date_time,
        ...min_wind[0].wind_low
      }
    }
  },

  getWindGraphData: async function () {
    const client = new Client();
    await client.connect();

    const { rows: wind_data } = await client.query(`
      SELECT dtg, TO_CHAR(dtg AT TIME ZONE 'pacific/auckland', 'DD HH24:MI') date_time, wind_mean, wind_high, wind_low
      FROM weather
      WHERE dtg >= NOW() - INTERVAL '24 hour'
      ORDER BY dtg ASC
    `)

    await client.end();

    return {
      wind_data: _.map(wind_data, (data)  => ({
        date_time: data.date_time,
        ...data.wind_mean
      })),
      wind_data_high: _.map(wind_data, (data)  => ({
        date_time: data.date_time,
        ...data.wind_high
      })),
      wind_data_low: _.map(wind_data, (data)  => ({
        date_time: data.date_time,
        ...data.wind_low
      })),
    }
  },

  getBaroGraphData: async function () {
    const client = new Client();
    await client.connect();

    const { rows: baro_data } = await client.query(`
      SELECT dtg, TO_CHAR(dtg AT TIME ZONE 'pacific/auckland', 'DD HH24:MI') date_time, baro, air_temp
      FROM weather
      WHERE dtg >= NOW() - INTERVAL '24 hour'
      ORDER BY dtg ASC
    `)

    await client.end();

    return {
      baro_data: _.map(baro_data, (data) => ({
        date_time: data.date_time,
        baro: this.convertAbsPressureToRel(data.baro, data.air_temp),
      }))
    }
  },

  getRainGraphData: async function () {
    const client = new Client();
    await client.connect();

    const { rows: rain_data } = await client.query(`
      SELECT ROUND(SUM(rain)::numeric, 1) as total_rain, TO_CHAR(DATE_TRUNC('day', dtg) AT TIME ZONE 'pacific/auckland', 'Mon DD') rain_day
      FROM weather
      WHERE dtg >= NOW() - INTERVAL '1 month'
      GROUP BY DATE_TRUNC('day', dtg)
      ORDER BY rain_day ASC
    `)

    await client.end();

    return {
      rain_data
    }

  }

}

module.exports = WeatherService;
