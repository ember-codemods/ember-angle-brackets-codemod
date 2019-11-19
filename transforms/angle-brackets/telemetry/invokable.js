const logger = require('debug');
const debug = logger('transform');
const HELPER = 'Helper';
const COMPONENT = 'Component';

function invokableName(name, type) {
  let invokePath = type === HELPER ? '/helpers/' : '/components/';
  return name.substring(name.lastIndexOf(invokePath) + invokePath.length, name.length);
}

function getInvokableData(telemetry) {
  let helpers = new Set();
  let components = new Set();
  let telemetryKeys = Object.keys(telemetry);

  debug(`\nknown modules:\n${JSON.stringify(telemetryKeys, null, 2)}`);
  for (let name of telemetryKeys) {
    let entry = telemetry[name];
    if (entry.type === HELPER) {
      helpers.add(invokableName(name, entry.type));
    }
    if (entry.type === COMPONENT) {
      components.add(invokableName(name, entry.type));
    }
  }

  helpers = Array.from(helpers);
  components = Array.from(components);

  debug(`\nHelpers found in telemetry:\n${JSON.stringify(helpers, null, 2)}`);
  debug(`\nComponents found in telemetry:\n${JSON.stringify(components, null, 2)}`);
  return { helpers, components };
}

module.exports = {
  getInvokableData,
};
