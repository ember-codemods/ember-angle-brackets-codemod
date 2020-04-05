#!/usr/bin/env node
'use strict';
const { gatherTelemetryForUrl, analyzeEmberObject } = require('ember-codemods-telemetry-helpers');

const argv = require('yargs').argv;

(async () => {
  if (argv.telemetry) {
    await gatherTelemetryForUrl(process.argv[2], analyzeEmberObject);
  }

  require('codemod-cli').runTransform(
    __dirname,
    'angle-brackets' /* transform name */,
    process.argv.slice(2) /* paths or globs */,
    'hbs'
  );
})();
