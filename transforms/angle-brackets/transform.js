const recast = require('ember-template-recast');

const _EMPTY_STRING_ = `ANGLE_BRACKET_EMPTY_${Date.now()}`;

/**
 * List of HTML attributes for which @ should not be appended
 */
const HTML_ATTRIBUTES = ['class', 'placeholder', 'required'];

const BUILT_IN_COMPONENTS = ['link-to', 'input', 'textarea'];

/**
 * Ignore the following list of MustacheStatements from transform
 * Politely lifted from https://github.com/lifeart/ember-ast-hot-load/blob/master/lib/ast-transform.js#L26
 */
const IGNORE_MUSTACHE_STATEMENTS = [
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
];

function isAttribute(key) {
  return HTML_ATTRIBUTES.includes(key) || key.startsWith('data-');
}

function isNestedComponentTagName(tagName) {
  return tagName && tagName.includes && (tagName.includes('/') || tagName.includes('-'));
}

/**
 *  Returns a capitalized tagname for angle brackets syntax
 *  {{my-component}} => MyComponent
 */
function capitalizedTagName(tagname) {
  return tagname
    .split('-')
    .map(s => {
      return s[0].toUpperCase() + s.slice(1);
    })
    .join('');
}

function transformTagName(tagName) {
  if (tagName.includes('.')) {
    return tagName;
  }

  if (isNestedComponentTagName(tagName)) {
    return transformNestedTagName(tagName);
  }

  return capitalizedTagName(tagName);
}

function transformNestedTagName(tagName) {
  const paths = tagName.split('/');
  return paths.map(name => capitalizedTagName(name)).join('::');
}

function transformNestedSubExpression(subExpression) {
  let positionalArgs = subExpression.params.map(param => {
    if (param.type === 'SubExpression') {
      return transformNestedSubExpression(param);
    } else if (param.type === 'StringLiteral') {
      return `"${param.original}"`;
    } else {
      return param.original;
    }
  });

  let namedArgs = [];
  if (subExpression.hash.pairs.length > 0) {
    namedArgs = subExpression.hash.pairs.map(pair => {
      if (pair.value.type === 'SubExpression') {
        let nestedValue = transformNestedSubExpression(pair.value);
        return `${pair.key}=${nestedValue}`;
      } else {
        if (pair.value.type === 'StringLiteral') {
          return `${pair.key}="${pair.value.original}"`;
        }
        return `${pair.key}=${pair.value.original}`;
      }
    });
  }

  let args = positionalArgs.concat(namedArgs);
  return `(${subExpression.path.original} ${args.join(' ')})`;
}

function shouldSkipFile(fileInfo, config) {
  let source = fileInfo.source;

  if (source.includes('~')) {
    //skip files with `~` until https://github.com/ember-codemods/ember-angle-brackets-codemod/issues/46 is resolved
    console.warn(
      `WARNING: ${fileInfo.path} was not converted as it contains a "~" (https://github.com/ember-codemods/ember-angle-brackets-codemod/issues/46)`
    );
    return true;
  }

  if (config.skipFilesThatMatchRegex && config.skipFilesThatMatchRegex.test(source)) {
    console.warn(
      `WARNING: ${fileInfo.path} was not skipped as its content matches the "skipFilesThatMatchRegex" config setting: ${config.skipFilesThatMatchRegex}`
    );
    return true;
  }

  return false;
}

module.exports = function transform(fileInfo, config) {
  config = config || {};
  config.helpers = config.helpers || [];
  config.skipBuiltInComponents =
    'skipBuiltInComponents' in config ? config.skipBuiltInComponents : false;
  config.skipFilesThatMatchRegex = config.skipFilesThatMatchRegex || null;

  if (shouldSkipFile(fileInfo, config)) {
    return fileInfo.source;
  }

  let { code: toAngleBracket } = recast.transform(fileInfo.source, env =>
    transformToAngleBracket(env, fileInfo, config)
  );

  let attrEqualEmptyString = new RegExp(_EMPTY_STRING_, 'gi');
  let dataEqualsNoValue = /(data-\S+)=""/gim;

  toAngleBracket = toAngleBracket.replace(attrEqualEmptyString, '');
  toAngleBracket = toAngleBracket.replace(dataEqualsNoValue, '$1');
  return toAngleBracket;
};

function transformToAngleBracket(env, fileInfo, config) {
  let { builders: b } = env.syntax;

  /**
   * Transform the attributes names & values properly
   */
  function transformAttrs(attrs) {
    return attrs.map(a => {
      let _key = a.key;
      let _valueType = a.value.type;
      let _value;
      if (!isAttribute(a.key)) {
        _key = `@${_key}`;
      }

      if (_valueType === 'PathExpression') {
        _value = b.mustache(a.value);
      } else if (_valueType === 'SubExpression') {
        if (a.value.hash.pairs.length > 0) {
          a.value.type = 'MustacheStatement';
          _value = a.value;
        } else {
          const params = a.value.params
            .map(p => {
              if (p.type === 'SubExpression') {
                return transformNestedSubExpression(p);
              } else if (p.type === 'StringLiteral') {
                return `"${p.original}"`;
              } else if (p.type === 'NullLiteral') {
                return 'null';
              } else if (p.type === 'UndefinedLiteral') {
                return 'undefined';
              } else {
                return p.original;
              }
            })
            .join(' ');

          _value = b.mustache(b.path(`${a.value.path.original} ${params}`));
        }
      } else if (_valueType === 'BooleanLiteral') {
        _value = b.mustache(b.boolean(a.value.original));
      } else if (_valueType === 'NumberLiteral') {
        _value = b.mustache(b.number(a.value.original));
      } else if (_valueType === 'NullLiteral') {
        _value = b.mustache('null');
      } else if (_valueType === 'UndefinedLiteral') {
        _value = b.mustache('undefined');
      } else {
        _value = b.text(a.value.original || _EMPTY_STRING_);
      }
      return b.attr(_key, _value);
    });
  }

  function isQueryParam(param) {
    return (
      param &&
      param.type === 'SubExpression' &&
      param.path &&
      param.path.original === 'query-params'
    );
  }

  function transformLinkToTextParam(textParam) {
    if (textParam.type === 'SubExpression') {
      return subExpressionToMustacheStatement(textParam);
    } else if (textParam.type.includes('Literal')) {
      return b.text(textParam.value);
    } else {
      return b.mustache(textParam.original);
    }
  }

  function transformModelParams(modelParam) {
    let type = modelParam.type;
    if (type === 'StringLiteral') {
      return b.text(modelParam.value);
    } else if (type === 'NumberLiteral') {
      return b.mustache(b.number(modelParam.original));
    } else {
      return b.mustache(modelParam.original);
    }
  }

  function transformLinkToAttrs(params) {
    let attributes = [];
    let dataAttributes = getDataAttributesFromParams(params);
    params = getNonDataAttributesFromParams(params);

    let firstParamInput = params[0];
    let firstParamOutput;

    if (isQueryParam(firstParamInput)) {
      firstParamOutput = b.attr('@query', b.mustache(b.path('hash'), [], firstParamInput.hash));
    } else if (firstParamInput.type === 'PathExpression') {
      firstParamOutput = b.attr('@route', b.mustache(firstParamInput.original));
    } else {
      firstParamOutput = b.attr('@route', b.text(firstParamInput.value));
    }

    if (params.length === 1) {
      attributes = [firstParamOutput];
    } else if (params.length === 2) {
      // @route and @model param

      // eslint-disable-next-line no-unused-vars
      let [_, secondParamInput] = params;
      if (secondParamInput.type === 'SubExpression') {
        let _queryParam = b.attr('@query', b.mustache(b.path('hash'), [], secondParamInput.hash));
        attributes = [firstParamOutput, _queryParam];
      } else {
        let _modelParam = b.attr('@model', transformModelParams(secondParamInput));
        attributes = [firstParamOutput, _modelParam];
      }
    } else if (params.length > 2) {
      // @route and @models params
      // eslint-disable-next-line no-unused-vars
      let [_, ...models] = params;
      let hasQueryParamHelper = isQueryParam(models[models.length - 1]);
      let _modelsParam;
      let _qpParam;

      if (hasQueryParamHelper) {
        _modelsParam = b.attr('@model', transformModelParams(models[0]));
        _qpParam = b.attr('@query', b.mustache(b.path('hash'), [], models[1].hash));
      } else {
        _modelsParam = b.attr('@models', b.mustache(b.path('array'), models));
      }
      attributes = [firstParamOutput, _modelsParam];
      if (_qpParam) {
        attributes.push(_qpParam);
      }
    }

    return attributes.concat(dataAttributes);
  }

  function tranformValuelessDataParams(params) {
    let dataAttributes = getDataAttributesFromParams(params);
    let valuelessDataAttributes = dataAttributes.map(param =>
      b.attr(param.parts[0], b.text(_EMPTY_STRING_))
    );
    return valuelessDataAttributes;
  }

  function transformNodeAttributes(node) {
    let params = tranformValuelessDataParams(node.params);
    let attributes = transformAttrs(node.hash.pairs);

    return params.concat(attributes);
  }

  function getDataAttributesFromParams(params) {
    return params.filter(param => param.original && `${param.original}`.startsWith('data-'));
  }

  function getNonDataAttributesFromParams(params) {
    return params.filter(p => !(p.original && `${p.original}`.startsWith('data-')));
  }

  function shouldIgnoreMustacheStatement(name) {
    return IGNORE_MUSTACHE_STATEMENTS.includes(name) || config.helpers.includes(name);
  }

  function nodeHasPositionalParameters(node) {
    if (node.params.length > 0) {
      let firstParamType = node.params[0].type;

      if (['StringLiteral', 'NumberLiteral', 'SubExpression'].includes(firstParamType)) {
        return true;
      } else if (firstParamType === 'PathExpression') {
        if (!isAttribute(node.params[0].original)) {
          return true;
        }
      }
    }

    return false;
  }

  function transformNode(node) {
    let selfClosing = node.type !== 'BlockStatement';
    const tagName = node.path.original;

    if (config.skipBuiltInComponents && BUILT_IN_COMPONENTS.includes(tagName)) {
      return;
    }

    const newTagName = transformTagName(tagName);

    let attributes;
    let children = node.program ? node.program.body : undefined;
    let blockParams = node.program ? node.program.blockParams : undefined;

    if (tagName === 'link-to') {
      selfClosing = false;

      if (node.type === 'MustacheStatement') {
        let params = node.params.slice();
        let textParam = params.shift(); //the first param becomes the block content

        attributes = transformLinkToAttrs(params);
        children = [transformLinkToTextParam(textParam)];
      } else {
        attributes = transformLinkToAttrs(node.params);
      }

      let namesParams = transformAttrs(node.hash.pairs);
      attributes = attributes.concat(namesParams);
    } else {
      if (nodeHasPositionalParameters(node)) {
        console.warn(
          `WARNING: {{${node.path.original}}} was not converted as it has positional parameters which can't be automatically converted. Source: ${fileInfo.path}`
        );
        return;
      }
      attributes = transformNodeAttributes(node);
    }

    return b.element(
      { name: newTagName, selfClosing },
      {
        attrs: attributes,
        children,
        blockParams,
      }
    );
  }

  function subExpressionToMustacheStatement(subExpression) {
    return b.mustache(subExpression.path, subExpression.params, subExpression.hash);
  }

  return {
    MustacheStatement(node) {
      // Don't change attribute statements
      const isValidMustache =
        node.loc.source !== '(synthetic)' && !shouldIgnoreMustacheStatement(node.path.original);
      const tagName = node.path && node.path.original;
      const isNestedComponent = isNestedComponentTagName(tagName);

      if (
        isValidMustache &&
        (node.hash.pairs.length > 0 || node.params.length > 0 || isNestedComponent)
      ) {
        return transformNode(node);
      }
    },

    BlockStatement(node) {
      if (!shouldIgnoreMustacheStatement(node.path.original)) {
        return transformNode(node);
      }
    },
  };
}
