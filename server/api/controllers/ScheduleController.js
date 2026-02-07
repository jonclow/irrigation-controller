const ScheduleService = require('../services/ScheduleService');
const chalk = require('chalk');
const { EMPTY_SCHEDULES } = require('../utils/defaultData');

module.exports = {
  setSchedule: async function (req, res) {
    try {
      const allSchedules = req.body.id === 'new'
        ? await ScheduleService.setSchedule(req.body.schedule)
        : await ScheduleService.updateSchedule(req.body.id, req.body.schedule);
      return res.send(allSchedules);
    } catch (error) {
      console.error(chalk.red('ScheduleController.setSchedule error:'), error.message);
      // Write operations fail with 503 - don't mask failures
      return res.status(503).send({
        error: 'Database unavailable',
        message: 'Unable to save schedule. Please try again later.',
        code: error.code
      });
    }
  },

  getAllSchedules: async function (req, res) {
    try {
      const schedules = await ScheduleService.getAllSchedules();
      return res.send(schedules);
    } catch (error) {
      console.error(chalk.red('ScheduleController.getAllSchedules error:'), error.message);
      // Read operations return empty array for graceful degradation
      return res.status(200).send([...EMPTY_SCHEDULES]);
    }
  },

  deleteSchedule: async function (req, res) {
    try {
      const schedules = await ScheduleService.deleteSchedule(req.body.id);
      return res.send(schedules);
    } catch (error) {
      console.error(chalk.red('ScheduleController.deleteSchedule error:'), error.message);
      // Write operations fail with 503
      return res.status(503).send({
        error: 'Database unavailable',
        message: 'Unable to delete schedule. Please try again later.',
        code: error.code
      });
    }
  },

  deleteAllSchedules: async function (req, res) {
    try {
      const result = await ScheduleService.deleteAllSchedules();
      return res.send(result);
    } catch (error) {
      console.error(chalk.red('ScheduleController.deleteAllSchedules error:'), error.message);
      // Write operations fail with 503
      return res.status(503).send({
        error: 'Database unavailable',
        message: 'Unable to delete schedules. Please try again later.',
        code: error.code
      });
    }
  },

}
