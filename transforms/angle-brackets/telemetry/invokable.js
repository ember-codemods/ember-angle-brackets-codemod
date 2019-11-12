const logger = require('debug');
const debug = logger('transform');
const HELPER = 'Helper';
const COMPONENT = 'Component';

function invokableName(name, type) {
  let helpersPath = type === HELPER ? '/helpers/' : '/components/';
  return name.substring(name.lastIndexOf(helpersPath) + helpersPath.length, name.length);
}

function getInvokableData(telemetry) {
  let helpers = [];
  let components = [];
  let telemetryKeys = Object.keys(telemetry);

  debug(`\nknown modules:\n${JSON.stringify(telemetry, null, 2)}`);
  for (let name of telemetryKeys) {
    let entry = telemetry[name];
    if (entry.type === HELPER) {
      helpers.push(invokableName(name, entry.type));
    }
    if (entry.type === COMPONENT) {
      components.push(invokableName(name, entry.type));
    }
  }

  debug(`\nHelpers found in telemetry:\n${JSON.stringify(helpers, null, 2)}`);
  debug(`\nComponents found in telemetry:\n${JSON.stringify(components, null, 2)}`);
  return { helpers, components };
}

module.exports = {
  getInvokableData,
};
