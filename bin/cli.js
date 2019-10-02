#!/usr/bin/env node
'use strict';

const { gatherTelemetryForUrl } = require('ember-codemods-telemetry-helpers');

(async () => {
  await gatherTelemetryForUrl(process.argv[2]);

  require('codemod-cli').runTransform(
    __dirname,
    'angle-brackets' /* transform name */,
    process.argv.slice(2) /* paths or globs */,
    'hbs'
  );
})();
