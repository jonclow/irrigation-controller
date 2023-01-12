const { Client } = require('pg');
const _ = require("lodash");

const ScheduleService = {

  scheduleCheckAndRun: async function (app) {
    const { toggleValves } = require('../services/ValveService');
    const async = require('async');
    const allSchedules = await this.getAllSchedules();

    const schedulesToRun = _.filter(allSchedules, (sched) => (
      sched.active
      && sched.days.includes((new Date()).getDay())
      && sched.start === (new Date()).toTimeString().substring(0, 5)
    ));

    if (_.isEmpty(schedulesToRun)) {
      return undefined;
    }

    await async.each(
      schedulesToRun,
      async (sched) => toggleValves(app, sched.valves, sched.duration),
    );
  },

  deleteSchedule: async function (id) {
    const client = new Client();
    await client.connect();
    await client.query(`
      DELETE FROM schedule
      WHERE id = $1
    `, [id]);

    const rows = await ScheduleService.getAllRowsHelper(client);

    await client.end();

    return rows;
  },

  deleteAllSchedules: async function () {
    const client = new Client();
    await client.connect();
    await client.query('TRUNCATE schedule');
    await client.end();

    return [];
  },

  setSchedule: async function (schedule) {
    console.log('--------- Set Schedule', {
      schedule,
    });
    const client = new Client();
    await client.connect();

    await client.query(`
      INSERT INTO schedule(active, name, start, days, valves, duration)
      VALUES($1, $2, $3, $4, $5, $6)
    `, [schedule.active, schedule.name, schedule.start, `${JSON.stringify(schedule.days)}`, `${JSON.stringify(schedule.valves)}`, schedule.duration]);

    const rows = await ScheduleService.getAllRowsHelper(client);

    await client.end();

    return rows;
  },

  updateSchedule: async function (id, schedule) {
    console.log('--------- Update Schedule', {
      id,
      schedule,
    });
    const client = new Client();
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

    await client.end();

    return rows;
  },

  getAllSchedules: async function () {
    console.log('--------- Get all schedules');
    const client = new Client();
    await client.connect();
    const rows = await this.getAllRowsHelper(client);
    await client.end();
    return rows;
  },

  getAllRowsHelper: async function (client) {
    console.log('--------- Get all rows helper');
    const { rows } = await client.query('SELECT * FROM schedule');
    return rows;
  },
};

module.exports = ScheduleService;
