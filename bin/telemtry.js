#!/usr/bin/env node
'use strict';

const { gatherTelemetry } = console.log(require('ember-codemods-telemetry-helpers'));

gatherTelemetry(process.argv[2]);
