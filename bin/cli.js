#!/usr/bin/env node
'use strict';
const { gatherTelemetryForUrl, analyzeEmberObject } = require('ember-codemods-telemetry-helpers');

const argv = require('yargs')
  .usage('Usage: $0 --telemetry=http://localhost:4200 [path or glob]')
  .alias('t', 'telemetry')
  .nargs('t', 1)
  .describe('t', 'Address of the development server')
  .help('h')
  .alias('h', 'help').argv;

(async () => {
  if (argv.telemetry) {
    await gatherTelemetryForUrl(argv.telemetry, analyzeEmberObject);
  }

  require('codemod-cli').runTransform(
    __dirname,
    'angle-brackets' /* transform name */,
    process.argv.slice(2) /* paths or globs */,
    'hbs'
  );
})();
