const { getOptions: getCLIOptions } = require('codemod-cli');
const { getTelemetry } = require('ember-codemods-telemetry-helpers');
const path = require('path');
const fs = require('fs');
const transform = require('./transform');
const { getHelperData } = require('./telemetry/helpers');

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
