const { Client } = require('pg');
const _ = require('lodash');
const chalk = require('chalk');
const dbErrorTracker = require('../utils/dbErrorTracker');
const { DEFAULT_WEATHER, EMPTY_GRAPH_DATA, EMPTY_BARO_DATA, EMPTY_RAIN_DATA } = require('../utils/defaultData');

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
    const operationName = 'addWeatherReading';
    const client = new Client();

    try {
      await client.connect();

      await client.query(`
        INSERT INTO weather(dtg, rain, baro, air_temp, humid, solar, wind_low, wind_high, wind_mean)
        VALUES(CURRENT_TIMESTAMP, $1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        wx.rain,
        wx.baro,
        wx.airtemp,
        wx.humid,
        wx.solar,
        wx.wslow,
        wx.wshigh,
        wx.wsmean
      ]);

      dbErrorTracker.recordSuccess(operationName);

      return {
        ..._.pick(wx, ['rain', 'humid', 'solar']),
        baro: this.convertAbsPressureToRel(wx.baro, wx.airtemp),
        air_temp: wx.airtemp,
        wind_mean: wx.wsmean,
        wind_low: wx.wslow,
        wind_high: wx.wshigh
      };

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);

      // For weather readings, log but don't crash - losing one reading is acceptable
      // However, track failures to detect persistent DB issues
      const shouldExit = dbErrorTracker.recordFailure(operationName, 'write', error);

      if (shouldExit) {
        console.error(chalk.red('Exiting process due to persistent database failure'));
        process.exit(1);
      }

      // Return the weather data anyway so socket can emit current values
      return {
        ..._.pick(wx, ['rain', 'humid', 'solar']),
        baro: this.convertAbsPressureToRel(wx.baro, wx.airtemp),
        air_temp: wx.airtemp,
        wind_mean: wx.wsmean,
        wind_low: wx.wslow,
        wind_high: wx.wshigh
      };

    } finally {
      try {
        await client.end();
      } catch (endError) {
        console.error(chalk.yellow('Error closing client in addWeatherReading:'), endError.message);
      }
    }
  },

  getBasicWeather: async function (dbClient) {
    const operationName = 'getBasicWeather';
    const client = dbClient || new Client();
    const shouldCleanup = !dbClient;

    try {
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
      ]);

      dbErrorTracker.recordSuccess(operationName);

      return {
        ...basic[0],
        ...rainfall1[0],
        ...rainfall24[0],
        ...rainfall48[0],
        ...rainfallWeek[0],
        baro: this.convertAbsPressureToRel(basic[0]?.baro || 1010, basic[0]?.air_temp || 15)
      };

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);

      const shouldExit = dbErrorTracker.recordFailure(operationName, 'read', error);

      if (shouldExit) {
        console.error(chalk.red('Exiting process due to persistent database failure'));
        process.exit(1);
      }

      // Return defaults for graceful degradation
      console.log(chalk.yellow(`Returning default weather data (failure ${dbErrorTracker.getFailureCount(operationName)})`));
      return { ...DEFAULT_WEATHER };

    } finally {
      if (shouldCleanup) {
        try {
          await client.end();
        } catch (endError) {
          console.error(chalk.yellow('Error closing client in getBasicWeather:'), endError.message);
        }
      }
    }
  },

  getDetailedWeather: async function () {
    const operationName = 'getDetailedWeather';
    const client = new Client();

    try {
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

      dbErrorTracker.recordSuccess(operationName);

      return {
        ...baseData,
        max_wind_24: max_wind[0] ? {
          date_time: max_wind[0].date_time,
          ...max_wind[0].wind_high
        } : {
          date_time: '',
          sp: 0,
          dir: 0
        },
        min_wind_24: min_wind[0] ? {
          date_time: min_wind[0].date_time,
          ...min_wind[0].wind_low
        } : {
          date_time: '',
          sp: 0,
          dir: 0
        }
      };

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);

      const shouldExit = dbErrorTracker.recordFailure(operationName, 'read', error);

      if (shouldExit) {
        console.error(chalk.red('Exiting process due to persistent database failure'));
        process.exit(1);
      }

      console.log(chalk.yellow(`Returning default weather data (failure ${dbErrorTracker.getFailureCount(operationName)})`));
      return { ...DEFAULT_WEATHER };

    } finally {
      try {
        await client.end();
      } catch (endError) {
        console.error(chalk.yellow('Error closing client in getDetailedWeather:'), endError.message);
      }
    }
  },

  getWindGraphData: async function () {
    const operationName = 'getWindGraphData';
    const client = new Client();

    try {
      await client.connect();

      const { rows: wind_data } = await client.query(`
        SELECT dtg, TO_CHAR(dtg AT TIME ZONE 'pacific/auckland', 'DD HH24:MI') date_time, wind_mean, wind_high, wind_low
        FROM weather
        WHERE dtg >= NOW() - INTERVAL '24 hour'
        ORDER BY dtg ASC
      `);

      dbErrorTracker.recordSuccess(operationName);

      return {
        wind_data: _.map(wind_data, (data) => ({
          date_time: data.date_time,
          ...data.wind_mean
        })),
        wind_data_high: _.map(wind_data, (data) => ({
          date_time: data.date_time,
          ...data.wind_high
        })),
        wind_data_low: _.map(wind_data, (data) => ({
          date_time: data.date_time,
          ...data.wind_low
        })),
      };

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);

      const shouldExit = dbErrorTracker.recordFailure(operationName, 'read', error);

      if (shouldExit) {
        console.error(chalk.red('Exiting process due to persistent database failure'));
        process.exit(1);
      }

      console.log(chalk.yellow(`Returning empty graph data (failure ${dbErrorTracker.getFailureCount(operationName)})`));
      return { ...EMPTY_GRAPH_DATA };

    } finally {
      try {
        await client.end();
      } catch (endError) {
        console.error(chalk.yellow('Error closing client in getWindGraphData:'), endError.message);
      }
    }
  },

  getBaroGraphData: async function () {
    const operationName = 'getBaroGraphData';
    const client = new Client();

    try {
      await client.connect();

      const { rows: baro_data } = await client.query(`
        SELECT dtg, TO_CHAR(dtg AT TIME ZONE 'pacific/auckland', 'DD HH24:MI') date_time, baro, air_temp
        FROM weather
        WHERE dtg >= NOW() - INTERVAL '24 hour'
        ORDER BY dtg ASC
      `);

      dbErrorTracker.recordSuccess(operationName);

      return {
        baro_data: _.map(baro_data || [], (data) => ({
          date_time: data.date_time,
          baro: this.convertAbsPressureToRel(data.baro, data.air_temp),
        }))
      };

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);

      const shouldExit = dbErrorTracker.recordFailure(operationName, 'read', error);

      if (shouldExit) {
        console.error(chalk.red('Exiting process due to persistent database failure'));
        process.exit(1);
      }

      console.log(chalk.yellow(`Returning empty graph data (failure ${dbErrorTracker.getFailureCount(operationName)})`));
      return { ...EMPTY_BARO_DATA };

    } finally {
      try {
        await client.end();
      } catch (endError) {
        console.error(chalk.yellow('Error closing client in getBaroGraphData:'), endError.message);
      }
    }
  },

  getRainGraphData: async function () {
    const operationName = 'getRainGraphData';
    const client = new Client();

    try {
      await client.connect();

      const { rows: rain_data } = await client.query(`
        SELECT ROUND(SUM(rain)::numeric, 1) as total_rain, TO_CHAR(DATE_TRUNC('day', dtg) AT TIME ZONE 'pacific/auckland', 'Mon DD') rain_day
        FROM weather
        WHERE dtg >= NOW() - INTERVAL '1 month'
        GROUP BY DATE_TRUNC('day', dtg)
        ORDER BY rain_day ASC
      `);

      dbErrorTracker.recordSuccess(operationName);

      return {
        rain_data
      };

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);

      const shouldExit = dbErrorTracker.recordFailure(operationName, 'read', error);

      if (shouldExit) {
        console.error(chalk.red('Exiting process due to persistent database failure'));
        process.exit(1);
      }

      console.log(chalk.yellow(`Returning empty graph data (failure ${dbErrorTracker.getFailureCount(operationName)})`));
      return { ...EMPTY_RAIN_DATA };

    } finally {
      try {
        await client.end();
      } catch (endError) {
        console.error(chalk.yellow('Error closing client in getRainGraphData:'), endError.message);
      }
    }
  }

}

module.exports = WeatherService;
