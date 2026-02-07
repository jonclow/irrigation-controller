const { Client } = require('pg');
const _ = require('lodash');
const chalk = require('chalk');
const dbErrorTracker = require('../utils/dbErrorTracker');
const { EMPTY_SCHEDULES } = require('../utils/defaultData');

const ScheduleService = {

  scheduleCheckAndRun: async function (app) {
    const operationName = 'scheduleCheckAndRun';

    try {
      const { toggleValves } = require('../services/ValveService');
      const async = require('async');
      const allSchedules = await this.getAllSchedules();

      const schedulesToRun = _.filter(allSchedules, (sched) => (
        sched.active
        && sched.days.includes((new Date()).getDay())
        && sched.start === (new Date()).toTimeString().substring(0, 5)
      ));

      if (_.isEmpty(schedulesToRun)) {
        dbErrorTracker.recordSuccess(operationName);
        return undefined;
      }

      await async.each(
        schedulesToRun,
        async (sched) => toggleValves(app, sched.valves, sched.duration),
      );

      dbErrorTracker.recordSuccess(operationName);

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);

      const shouldExit = dbErrorTracker.recordFailure(operationName, 'cron', error);

      if (shouldExit) {
        console.error(chalk.red('⚠️ CRITICAL: Schedule system persistently failing'));
        console.error(chalk.red('Irrigation schedules cannot run - exiting to alert operators'));
        process.exit(1);
      }

      console.log(chalk.yellow(`Skipping schedule check this minute (failure ${dbErrorTracker.getFailureCount(operationName)})`));
      return undefined;
    }
  },

  deleteSchedule: async function (id) {
    const operationName = 'deleteSchedule';
    const client = new Client();

    try {
      await client.connect();
      await client.query(`
        DELETE FROM schedule
        WHERE id = $1
      `, [id]);

      const rows = await ScheduleService.getAllRowsHelper(client);

      dbErrorTracker.recordSuccess(operationName);

      return rows;

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);

      const shouldExit = dbErrorTracker.recordFailure(operationName, 'write', error);

      if (shouldExit) {
        console.error(chalk.red('Exiting process due to persistent database failure'));
        process.exit(1);
      }

      // Write operations should throw - don't mask failures
      throw error;

    } finally {
      try {
        await client.end();
      } catch (endError) {
        console.error(chalk.yellow('Error closing client in deleteSchedule:'), endError.message);
      }
    }
  },

  deleteAllSchedules: async function () {
    const operationName = 'deleteAllSchedules';
    const client = new Client();

    try {
      await client.connect();
      await client.query('TRUNCATE schedule');

      dbErrorTracker.recordSuccess(operationName);

      return [];

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);

      const shouldExit = dbErrorTracker.recordFailure(operationName, 'write', error);

      if (shouldExit) {
        console.error(chalk.red('Exiting process due to persistent database failure'));
        process.exit(1);
      }

      throw error;

    } finally {
      try {
        await client.end();
      } catch (endError) {
        console.error(chalk.yellow('Error closing client in deleteAllSchedules:'), endError.message);
      }
    }
  },

  setSchedule: async function (schedule) {
    const operationName = 'setSchedule';
    const client = new Client();

    try {
      await client.connect();

      await client.query(`
        INSERT INTO schedule(active, name, start, days, valves, duration)
        VALUES($1, $2, $3, $4, $5, $6)
      `, [schedule.active, schedule.name, schedule.start, `${JSON.stringify(schedule.days)}`, `${JSON.stringify(schedule.valves)}`, schedule.duration]);

      const rows = await ScheduleService.getAllRowsHelper(client);

      dbErrorTracker.recordSuccess(operationName);

      return rows;

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);

      const shouldExit = dbErrorTracker.recordFailure(operationName, 'write', error);

      if (shouldExit) {
        console.error(chalk.red('Exiting process due to persistent database failure'));
        process.exit(1);
      }

      throw error;

    } finally {
      try {
        await client.end();
      } catch (endError) {
        console.error(chalk.yellow('Error closing client in setSchedule:'), endError.message);
      }
    }
  },

  updateSchedule: async function (id, schedule) {
    const operationName = 'updateSchedule';
    const client = new Client();

    try {
      await client.connect();

      await client.query(`
        UPDATE schedule
        SET active = $1,
          name = $2,
          start = $3,
          days = $4,
          valves = $5,
          duration = $6
        WHERE id = $7
      `, [schedule.active, schedule.name, schedule.start, `${JSON.stringify(schedule.days)}`, `${JSON.stringify(schedule.valves)}`, schedule.duration, id]);

      const rows = await ScheduleService.getAllRowsHelper(client);

      dbErrorTracker.recordSuccess(operationName);

      return rows;

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);

      const shouldExit = dbErrorTracker.recordFailure(operationName, 'write', error);

      if (shouldExit) {
        console.error(chalk.red('Exiting process due to persistent database failure'));
        process.exit(1);
      }

      throw error;

    } finally {
      try {
        await client.end();
      } catch (endError) {
        console.error(chalk.yellow('Error closing client in updateSchedule:'), endError.message);
      }
    }
  },

  getAllSchedules: async function () {
    const operationName = 'getAllSchedules';
    const client = new Client();

    try {
      await client.connect();
      const rows = await this.getAllRowsHelper(client);

      dbErrorTracker.recordSuccess(operationName);

      return rows;

    } catch (error) {
      console.error(chalk.red(`${operationName} failed:`), error.message);

      const shouldExit = dbErrorTracker.recordFailure(operationName, 'read', error);

      if (shouldExit) {
        console.error(chalk.red('Exiting process due to persistent database failure'));
        process.exit(1);
      }

      // Return empty schedules for graceful degradation
      console.log(chalk.yellow(`Returning empty schedules (failure ${dbErrorTracker.getFailureCount(operationName)})`));
      return [...EMPTY_SCHEDULES];

    } finally {
      try {
        await client.end();
      } catch (endError) {
        console.error(chalk.yellow('Error closing client in getAllSchedules:'), endError.message);
      }
    }
  },

  getAllRowsHelper: async function (client) {
    const { rows } = await client.query('SELECT * FROM schedule');
    return rows;
  },
};

module.exports = ScheduleService;
