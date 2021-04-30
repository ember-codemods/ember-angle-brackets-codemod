const { getOptions: getCLIOptions } = require('codemod-cli');
const { getTelemetry } = require('ember-codemods-telemetry-helpers');
const path = require('path');
const fs = require('fs');
const transform = require('./transform');
const { getInvokableData } = require('./telemetry/invokable');

function getOptions() {
  let options = {};

  let cliOptions = getCLIOptions();
  if (cliOptions.config) {
    let filePath = path.join(process.cwd(), cliOptions.config);
    let config = JSON.parse(fs.readFileSync(filePath));

    if (config.helpers) {
      options.helpers = config.helpers;
    }

    if (config.components) {
      options.components = config.components;
    }

    if (config.skipAttributesThatMatchRegex) {
      options.skipAttributesThatMatchRegex = config.skipAttributesThatMatchRegex;
    }

    if (config.skipFilesThatMatchRegex) {
      options.skipFilesThatMatchRegex = new RegExp(config.skipFilesThatMatchRegex);
    }

    options.includeValuelessDataTestAttributes = !!config.includeValuelessDataTestAttributes;
    options.skipBuiltInComponents = !!config.skipBuiltInComponents;
  }

  if (cliOptions.telemetry) {
    options.telemetry = cliOptions.telemetry;
  }

  return options;
}

module.exports = function (file) {
  const options = getOptions();
  let invokableData = options.telemetry ? getInvokableData(getTelemetry()) : {};
  try {
    return transform(file, options, invokableData);
  } catch (e) {
    throw new Error(
      `Transformation errored on file ${file.path}. Reason ${e}. Please report this in https://github.com/ember-codemods/ember-angle-brackets-codemod/issues\n\nStack trace:\n${e.stack}`
    );
  }
};
