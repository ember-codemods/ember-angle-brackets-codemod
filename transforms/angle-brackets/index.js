const { getOptions: getCLIOptions } = require('codemod-cli');
const { getTelemetry } = require('ember-codemods-telemetry-helpers');
const path = require('path');
const fs = require('fs');
const transform = require('./transform');
const logger = require('debug');
const debug = logger('transform');

function getOptions() {
  let options = {};

  let cliOptions = getCLIOptions();
  if (cliOptions.config) {
    let filePath = path.join(process.cwd(), cliOptions.config);
    let config = JSON.parse(fs.readFileSync(filePath));

    if (config.helpers) {
      options.helpers = config.helpers;
    }

    if (config.skipFilesThatMatchRegex) {
      options.skipFilesThatMatchRegex = new RegExp(config.skipFilesThatMatchRegex);
    }

    options.skipBuiltInComponents = !!config.skipBuiltInComponents;
  }

  return options;
}

function helperName(name) {
  let helpersPath = '/helpers/';
  return name.substring(name.lastIndexOf(helpersPath) + helpersPath.length, name.length);
}

function getHelperData(telemetry) {
  let helpers = [];
  let telemetryKeys = Object.keys(telemetry);
  for (let name of telemetryKeys) {
    let entry = telemetry[name];
    if (entry.type === 'Helper') {
      helpers.push(helperName(name));
    }
  }
  debug(JSON.stringify(telemetryKeys, null, 2));
  debug(JSON.stringify(helpers, null, 2));
  return helpers;
}

module.exports = function(file) {
  let helpers = getHelperData(getTelemetry());
  try {
    return transform(file, getOptions(), helpers);
  } catch (e) {
    throw new Error(
      `Transformation errored on file ${file.path}. Reason ${e}. Please report this in https://github.com/ember-codemods/ember-angle-brackets-codemod/issues\n\nStack trace:\n${e.stack}`
    );
  }
};
