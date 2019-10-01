const KNOWN_HELPERS = [
  // Ember.js
  'action',
  'array',
  'component',
  'concat',
  'debugger',
  'each',
  'each-in',
  'else',
  'get',
  'hash',
  'if',
  'if-unless',
  'in-element',
  '-in-element',
  'let',
  'loc',
  'log',
  'mut',
  'outlet',
  'partial',
  'query-params',
  'readonly',
  'unbound',
  'unless',
  'with',
  'yield',

  // Glimmer VM
  'identity', // glimmer blocks
  'render-inverse', // glimmer blocks
  '-get-dynamic-var', // glimmer internal helper

  // ember-route-helpers
  'transition-to',
  'replace-with',
  'transition-to-external',
  'replace-with-external',

  // ember-intl
  'format-date',
  'format-message',
  'format-relative',
  'format-time',
  'format-money',
  'format-number',
  't',

  // ember-moment
  'is-after',
  'is-before',
  'is-between',
  'is-same',
  'is-same-or-after',
  'is-same-or-before',
  'moment',
  'moment-calendar',
  'moment-diff',
  'moment-duration',
  'moment-format',
  'moment-from',
  'moment-from-now',
  'moment-to',
  'moment-to-now',
  'now',
  'unix',

  // ember-cp-validations
  'v-get',

  // ember-route-action-helper
  'route-action',

  // ember-composable-helpers
  'map-by',
  'sort-by',
  'filter-by',
  'reject-by',
  'find-by',
  'object-at',
  'has-block',
  'has-next',
  'has-previous',
  'group-by',
  'not-eq',
  'is-array',
  'is-empty',
  'is-equal',

  // liquid-fire
  'liquid-unless',
  'liquid-container',
  'liquid-outlet',
  'liquid-versions',
  'liquid-bind',
  'liquid-spacer',
  'liquid-sync',
  'liquid-measured',
  'liquid-child',
  'liquid-if',

  // ember-animated
  'animated-beacon',
  'animated-each',
  'animated-if',
  'animated-orphans',
  'animated-value',

  // ember-app-version
  'app-version',

  // ember-font-awesome
  'fa-icon',
  'fa-list',
  'fa-stack',

  // ember-svg-jar
  'svg-jar',

  // ember-concurrency
  'perform',

  // ember-maybe-in-element
  'maybe-in-element',
];

module.exports = KNOWN_HELPERS;
