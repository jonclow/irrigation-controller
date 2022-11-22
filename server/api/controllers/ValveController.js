const _ = require('lodash');
const ValveService = require('../services/ValveService');

exports.toggleValve = async function (req, res) {
  const appValveState = await ValveService.toggleValves(req.app, [req.body.id], req.body.duration);
  return res.send(_.map(appValveState, (v) => _.pick(v, ['id', 'name', 'status'])));
}

exports.getValveState = async function (req, res) {
  res.send(_.map(await req.app.get('valve_state'), (v) => _.pick(v, ['id', 'name', 'status'])));
}
