#!/usr/bin/env node
'use strict';

const { gatherTelemetryForUrl, analyzeEmberObject } = require('ember-codemods-telemetry-helpers');

(async () => {
  await gatherTelemetryForUrl('http://localhost:4200', analyzeEmberObject);

  require('codemod-cli').runTransform(
    __dirname,
    'angle-brackets' /* transform name */,
    process.argv.slice(2) /* paths or globs */,
    'hbs'
  );
})();
