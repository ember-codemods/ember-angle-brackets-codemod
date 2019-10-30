const logger = require('debug');
const debug = logger('transform');

function helperName(name) {
  let helpersPath = '/helpers/';
  return name.substring(name.lastIndexOf(helpersPath) + helpersPath.length, name.length);
}

function getHelperData(telemetry) {
  let helpers = [];
  let telemetryKeys = Object.keys(telemetry);

  debug(`\nknown modules:\n${JSON.stringify(telemetry, null, 2)}`);
  for (let name of telemetryKeys) {
    let entry = telemetry[name];
    if (entry.type === 'Helper') {
      helpers.push(helperName(name));
    }
  }

  debug(`\nHelpers found in telemetry:\n${JSON.stringify(helpers, null, 2)}`);
  return helpers;
}

module.exports = {
  getHelperData,
};
