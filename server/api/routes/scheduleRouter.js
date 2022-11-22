const express = require('express');
const router = express.Router();

const ScheduleController = require('../controllers/ScheduleController');

router.put('/setSchedule', ScheduleController.setSchedule);
router.get('/getAllSchedules', ScheduleController.getAllSchedules);
router.delete('/deleteSchedule', ScheduleController.deleteSchedule);
router.delete('/deleteAllSchedules', ScheduleController.deleteAllSchedules);

router.get('/', ScheduleController.getAllSchedules);

module.exports = router;
