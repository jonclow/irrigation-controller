const ScheduleService = require('../services/ScheduleService');

module.exports = {
  setSchedule: async function (req, res) {
    const allSchedules = req.body.id === 'new' ? await ScheduleService.setSchedule(req.body.schedule) : await ScheduleService.updateSchedule(req.body.id, req.body.schedule);
    return res.send(allSchedules);
  },

  getAllSchedules: async function (req, res) {
    return res.send(await ScheduleService.getAllSchedules());
  },

  deleteSchedule: async function (req, res) {
    return res.send(await ScheduleService.deleteSchedule(req.body.id));
  },

  deleteAllSchedules: async function (req, res) {
    return res.send(await ScheduleService.deleteAllSchedules());
  },

}
