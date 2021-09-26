const _ = require('lodash');
const ValveService = require('../services/ValveService');

exports.toggleValve = async function (req, res) {
  let appValveState = await req.app.get('valve_state');
  const targetValve = _.find(appValveState, { id: req.body.id });

  if (targetValve.pinControl.readSync() === 1) {
    targetValve.pinControl.writeSync(0);
    targetValve.timeOutObject = setTimeout(ValveService.turnOffValveTimeout, req.body.duration * 60000, req.body.id, req.app);
  } else {
    targetValve.pinControl.writeSync(1);
    if (_.has(targetValve, 'timeOutObject')) {
      clearTimeout(targetValve.timeOutObject);
      delete targetValve.timeOutObject;
    }
  }

  appValveState = _.map(appValveState, (valve) => {
    if (valve.id !== req.body.id) {
      return valve;
    }

    return {
      ...valve,
      status: targetValve.pinControl.readSync(),
    };
  });

  await req.app.set('valve_state', appValveState);
  return res.send(_.map(appValveState, (v) => _.pick(v, ['id', 'name', 'status'])));
}

exports.getValveState = async function (req, res) {
  res.send(_.map(await req.app.get('valve_state'), (v) => _.pick(v, ['id', 'name', 'status'])));
}
