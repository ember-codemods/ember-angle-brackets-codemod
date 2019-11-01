'use strict';
const { getHelperData } = require('../telemetry/helpers');

describe('Extract Helpers from Telemetry Data`', () => {
  test('helper names from addons: addon/helpers/*', () => {
    const addonTelemetry = {
      'ember-bootstrap/helpers/bs-contains': {
        type: 'Helper',
      },
    };
    expect(getHelperData(addonTelemetry)).toEqual(['bs-contains']);
  });

  test('helper names from addons: addon/helpers/* - subfolders', () => {
    const addonTelemetry = {
      'ember-bootstrap/helpers/utils/bs-contains': {
        type: 'Helper',
      },
    };
    expect(getHelperData(addonTelemetry)).toEqual(['utils/bs-contains']);
  });

  test('helper names from host app: app/helpers/*', () => {
    const appTelemetry = {
      'app/helpers/biz-baz': {
        type: 'Helper',
      },
    };
    expect(getHelperData(appTelemetry)).toEqual(['biz-baz']);
  });

  test('helper names from host app: app/helpesr/* - subfolders', () => {
    const appTelemetry = {
      'app/helpers/utility/biz-baz': {
        type: 'Helper',
      },
    };
    expect(getHelperData(appTelemetry)).toEqual(['utility/biz-baz']);
  });

  test('helper names from host app: app/helpesr/* - hyphen usage', () => {
    const appTelemetry = {
      'app/helpers/-biz-baz': {
        type: 'Helper',
      },
    };
    expect(getHelperData(appTelemetry)).toEqual(['-biz-baz']);
  });

  test('helper names from host app: app/helpesr/* - hyphen usage / subfolders', () => {
    const appTelemetry = {
      'app/helpers/utility/-biz-baz': {
        type: 'Helper',
      },
    };
    expect(getHelperData(appTelemetry)).toEqual(['utility/-biz-baz']);
  });

  test('helper names from host app: app/helpesr/* - deeply nested hyphen mixture', () => {
    const appTelemetry = {
      'app/helpers/utility/-/deeply/-nested/-in/-biz-baz': {
        type: 'Helper',
      },
    };
    expect(getHelperData(appTelemetry)).toEqual(['utility/-/deeply/-nested/-in/-biz-baz']);
  });
});
