'use strict';
const { getInvokableData } = require('../telemetry/invokable');

describe('Extract Helpers from Telemetry Data`', () => {
  test('helper names from addons: addon/helpers/*', () => {
    const addonTelemetry = {
      'ember-bootstrap/helpers/bs-contains': {
        type: 'Helper',
      },
    };
    expect(getInvokableData(addonTelemetry)).toEqual({
      components: [],
      helpers: ['bs-contains'],
    });
  });

  test('helper names from addons: addon/helpers/* - subfolders', () => {
    const addonTelemetry = {
      'ember-bootstrap/helpers/utils/bs-contains': {
        type: 'Helper',
      },
      'ember-bootstrap/components/bs-navbar/nav': {
        type: 'Component',
      },
    };
    expect(getInvokableData(addonTelemetry)).toEqual({
      components: ['bs-navbar/nav'],
      helpers: ['utils/bs-contains'],
    });
  });

  test('helper names from host app: app/helpers/*', () => {
    const appTelemetry = {
      'app/helpers/biz-baz': {
        type: 'Helper',
      },
    };
    expect(getInvokableData(appTelemetry)).toEqual({ components: [], helpers: ['biz-baz'] });
  });

  test('helper names from host app: app/helpesr/* - subfolders', () => {
    const appTelemetry = {
      'app/helpers/utility/biz-baz': {
        type: 'Helper',
      },
    };
    expect(getInvokableData(appTelemetry)).toEqual({
      components: [],
      helpers: ['utility/biz-baz'],
    });
  });

  test('helper names from host app: app/helpesr/* - hyphen usage', () => {
    const appTelemetry = {
      'app/helpers/-biz-baz': {
        type: 'Helper',
      },
    };
    expect(getInvokableData(appTelemetry)).toEqual({ components: [], helpers: ['-biz-baz'] });
  });

  test('helper names from host app: app/helpesr/* - hyphen usage / subfolders', () => {
    const appTelemetry = {
      'app/helpers/utility/-biz-baz': {
        type: 'Helper',
      },
    };
    expect(getInvokableData(appTelemetry)).toEqual({
      components: [],
      helpers: ['utility/-biz-baz'],
    });
  });

  test('helper names from host app: app/helpesr/* - deeply nested hyphen mixture', () => {
    const appTelemetry = {
      'app/helpers/utility/-/deeply/-nested/-in/-biz-baz': {
        type: 'Helper',
      },
    };
    expect(getInvokableData(appTelemetry)).toEqual({
      components: [],
      helpers: ['utility/-/deeply/-nested/-in/-biz-baz'],
    });
  });
});
