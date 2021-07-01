const recast = require('ember-template-recast');
const logger = require('../../lib/logger');

const KNOWN_HELPERS = require('./known-helpers');
const _EMPTY_STRING_ = `ANGLE_BRACKET_EMPTY_${Date.now()}`;
const { builders: b } = recast;

/**
 * List of HTML attributes for which @ should not be appended
 */
const HTML_ATTRIBUTES = ['class', 'placeholder', 'required'];
const BUILT_IN_COMPONENTS = ['link-to', 'input', 'textarea'];

let inAttr = false;

function isAttribute(key) {
  return HTML_ATTRIBUTES.includes(key) || isDataAttribute(key);
}

/**
 * Returns true if the key matches any of the user provided regex from the
 * `skipAttributesThatMatchRegex` array.
 * @param {*} key
 * @param {*} config
 */
function shouldSkipAttribute(key, config) {
  if (config.skipAttributesThatMatchRegex && config.skipAttributesThatMatchRegex.length) {
    return config.skipAttributesThatMatchRegex.some((rx) => {
      // Get the user provided string and convert it to regex.
      const match = /^\/(.*)\/([a-z]*)$/.exec(rx);
      if (match) {
        const regex = new RegExp(match[1], match[2]);
        return regex.test(key);
      }
    });
  }
  return false;
}

function isDataAttribute(key) {
  return key.startsWith('data-');
}

function isBuiltInComponent(key) {
  return BUILT_IN_COMPONENTS.includes(key);
}

function isNestedComponentTagName(tagName) {
  return tagName && tagName.includes && (tagName.includes('/') || tagName.includes('-'));
}

function isWallStreet(tagName) {
  return tagName.includes('$') || tagName.includes('::');
}

/**
 *  Returns a transformed capitalized tagname for angle brackets syntax
 *  {{my-component}} => MyComponent
 */
function transformTagName(tagName) {
  const SIMPLE_DASHERIZE_REGEXP = /[a-z]|\/|-/g;
  const ALPHA = /[A-Za-z0-9]/;

  if (tagName.includes('.')) {
    return tagName;
  }

  tagName = tagName.replace(SIMPLE_DASHERIZE_REGEXP, (char, index) => {
    if (char === '/') {
      return '::';
    }

    if (index === 0 || !ALPHA.test(tagName[index - 1])) {
      return char.toUpperCase();
    }

    // Remove all occurrences of '-'s from the tagName that aren't starting with `-`
    return char === '-' ? '' : char.toLowerCase();
  });

  return tagName;
}

function transformNestedSubExpression(subExpression) {
  let positionalArgs = subExpression.params.map((param) => {
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
    namedArgs = subExpression.hash.pairs.map((pair) => {
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

  if (config.skipFilesThatMatchRegex && config.skipFilesThatMatchRegex.test(source)) {
    logger.warn(
      `WARNING: ${fileInfo.path} was skipped as its content matches the "skipFilesThatMatchRegex" config setting: ${config.skipFilesThatMatchRegex}`
    );
    return true;
  }

  return false;
}

function transformAttrs(tagName, attrs, config) {
  return attrs.map((a) => {
    let _key = a.key;
    let _valueType = a.value.type;
    let _value;
    if (
      (!isAttribute(_key) || !isBuiltInComponent(tagName)) &&
      !shouldSkipAttribute(_key, config)
    ) {
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
          .map((p) => {
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
    param && param.type === 'SubExpression' && param.path && param.path.original === 'query-params'
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
  } else if (firstParamInput.type === 'SubExpression') {
    firstParamOutput = b.attr(
      '@route',
      b.mustache(firstParamInput.path, firstParamInput.params, firstParamInput.hash)
    );
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
      let _queryParamOrModel;
      if (isQueryParam(secondParamInput)) {
        _queryParamOrModel = b.attr(
          '@query',
          b.mustache(b.path('hash'), [], secondParamInput.hash)
        );
      } else {
        _queryParamOrModel = b.attr(
          '@model',
          b.mustache(secondParamInput.path, secondParamInput.params)
        );
      }
      attributes = [firstParamOutput, _queryParamOrModel];
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
      if (models.length < 3) {
        _modelsParam = b.attr('@model', transformModelParams(models[0]));
      } else {
        _modelsParam = b.attr(
          '@models',
          b.mustache(b.path('array'), models.slice(0, models.length - 1))
        );
      }
      _qpParam = b.attr('@query', b.mustache(b.path('hash'), [], models[models.length - 1].hash));
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

function hasValuelessDataParams(params) {
  return getDataAttributesFromParams(params).length > 0;
}

/**
 *
 * data-* attributes are generally omitted,
 * but this config allows including nodes with data-test-* attributes.
 */
function shouldSkipDataTestParams(params, includeValuelessDataTestAttributes) {
  if (includeValuelessDataTestAttributes) {
    const dataAttrs = getDataAttributesFromParams(params);
    // This is true for nodes with data-* attributes too,
    // as long as there is one with data-test-* attribute.
    return !dataAttrs.some((attr) => attr.original.startsWith('data-test-'));
  }
  return true;
}

function transformNodeAttributes(tagName, node, config) {
  let attributes = transformAttrs(tagName, node.hash.pairs, config);
  return node.params.concat(attributes);
}

function isDataAttrPathExpression(node) {
  return node.type === 'PathExpression' && node.original.startsWith('data-');
}

function getDataAttributesFromParams(params) {
  return params.filter((it) => isDataAttrPathExpression(it));
}

function getNonDataAttributesFromParams(params) {
  return params.filter((it) => !isDataAttrPathExpression(it));
}

function shouldIgnoreMustacheStatement(fullName, config, invokableData) {
  let { helpers, components } = invokableData;
  let isTelemetryData = !!(helpers || components);

  let name = fullName;
  // replace `::` with `/`, and ignore the path before $
  if (isWallStreet(name)) {
    name = name.split('$').pop().replace('::', '/');
  }

  if (isTelemetryData) {
    let mergedHelpers = [...KNOWN_HELPERS, ...(helpers || [])];
    let isHelper = mergedHelpers.includes(name) || config.helpers.includes(name);
    let isComponent = [...(components || []), ...BUILT_IN_COMPONENTS].includes(name);
    let strName = `${name}`; // coerce boolean and number to string
    return (isHelper || !isComponent) && !strName.includes('.');
  } else {
    return KNOWN_HELPERS.includes(name) || config.helpers.includes(name);
  }
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

function transformNode(node, fileInfo, config) {
  if (
    hasValuelessDataParams(node.params) &&
    shouldSkipDataTestParams(node.params, config.includeValuelessDataTestAttributes)
  ) {
    return;
  }
  let selfClosing = node.type !== 'BlockStatement';
  const tagName = node.path.original;

  if (config.skipBuiltInComponents && isBuiltInComponent(tagName)) {
    return;
  }

  if (node.inverse) {
    return;
  }

  const newTagName = transformTagName(tagName, inAttr);

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

    let namesParams = transformAttrs(tagName, node.hash.pairs, config);
    attributes = attributes.concat(namesParams);
  } else {
    if (nodeHasPositionalParameters(node)) {
      logger.warn(
        `WARNING: {{${node.path.original}}} was not converted as it has positional parameters which can't be automatically converted. Source: ${fileInfo.path}`
      );
      return;
    }

    if (inAttr) {
      return;
    }
    attributes = transformNodeAttributes(tagName, node, config);
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

module.exports = function transform(fileInfo, config, invokableData = {}) {
  config = config || {};
  config.helpers = config.helpers || [];
  config.skipBuiltInComponents =
    'skipBuiltInComponents' in config ? config.skipBuiltInComponents : false;
  config.skipFilesThatMatchRegex = config.skipFilesThatMatchRegex || null;

  if (shouldSkipFile(fileInfo, config)) {
    return fileInfo.source;
  }

  let { code: toAngleBracket } = recast.transform(fileInfo.source, () =>
    transformToAngleBracket(fileInfo, config, invokableData)
  );

  let attrEqualEmptyString = new RegExp(_EMPTY_STRING_, 'gi');
  let dataEqualsNoValue = /(data-\S+)=""/gim;

  toAngleBracket = toAngleBracket.replace(attrEqualEmptyString, '');
  toAngleBracket = toAngleBracket.replace(dataEqualsNoValue, '$1');
  return toAngleBracket;
};

function transformToAngleBracket(fileInfo, config, invokableData) {
  /**
   * Transform the attributes names & values properly
   */
  return {
    MustacheStatement(node) {
      const tagName = `${node.path && node.path.original}`;

      if (config.components && !config.components.includes(tagName)) return;

      // Don't change attribute statements
      const isValidMustache =
        node.loc.source !== '(synthetic)' &&
        !shouldIgnoreMustacheStatement(tagName, config, invokableData);
      const isNestedComponent = isNestedComponentTagName(tagName);

      if (
        isValidMustache &&
        (node.hash.pairs.length > 0 || node.params.length > 0 || isNestedComponent)
      ) {
        return transformNode(node, fileInfo, config);
      }
    },
    BlockStatement(node) {
      let tagName = `${node.path.original}`;

      if (config.components && !config.components.includes(tagName)) return;

      if (
        !shouldIgnoreMustacheStatement(node.path.original, config, invokableData) ||
        isWallStreet(tagName)
      ) {
        return transformNode(node, fileInfo, config);
      }
    },
    AttrNode: {
      enter() {
        inAttr = true;
      },
      exit() {
        inAttr = false;
      },
    },
  };
}
