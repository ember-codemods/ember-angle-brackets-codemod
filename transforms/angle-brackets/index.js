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

function helperNames(helperPaths) {
  return [
    ...new Set(
      helperPaths
        .filter(name => name.includes('/helpers/') || name.includes('/helper'))
        .filter(name => !name.includes('/-'))
        .map(name => {
          let path = name.split('/helpers/');
          return path.pop();
        })
        .filter(name => !name.includes('/'))
    ),
  ];
}

function getHelperData(telemetry) {
  let helperPaths = [];
  let telemetryKeys = Object.keys(telemetry);
  for (let path of telemetryKeys) {
    let entry = telemetry[path];
    if (entry.type === 'Helper') {
      helperPaths.push(path);
    }
  }
  let helpers = helperNames(helperPaths);
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
