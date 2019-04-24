const glimmer = require('@glimmer/syntax');
const prettier = require("prettier");
const path = require('path');
const fs = require('fs');

class Config {
  constructor(options) {
    this.helpers = [];

    if (options.config) {
      let filePath = path.join(process.cwd(), options.config);
      let data = JSON.parse(fs.readFileSync(filePath));

      if (data.helpers) {
        this.helpers = data.helpers;
      }
    }
  }
}

/**
 * List of HTML attributes for which @ should not be appended
 */
const HTML_ATTRIBUTES = [
  "class",
  "placeholder",
  "required"
];

/**
 * Ignore the following list of MustacheStatements from transform
 * Politely lifted from https://github.com/lifeart/ember-ast-hot-load/blob/master/lib/ast-transform.js#L26
 */
const IGNORE_MUSTACHE_STATEMENTS = [
  "identity", // glimmer blocks
  "render-inverse", // glimmer blocks
  "-get-dynamic-var", // glimmer internal helper
  "-lf-get-outlet-state", // dunno
  "action",
  "component",
  "hot-content",
  "hot-placeholder",
  "if",
  "if-unless",
  "each",
  "each-in",
  "format-date",
  "format-message",
  "format-relative",
  "format-time",
  "format-money",
  "format-number",
  "unless",
  "in-element",
  "query-params",
  "-in-element",
  "-class",
  "-html-safe",
  "-input-type",
  "-normalize-class",
  "concat",
  "get",
  "mut",
  "readonly",
  "unbound",
  "debugger",
  "else",
  "let",
  "log",
  "loc",
  "hash",
  "partial",
  "yield",
  "t",
  "t-for",
  "transition-to",
  "get-meta",
  "get-attr",
  "index-of",

  //ember-moment
  "moment-format",
  "moment-from-now",
  "moment-from",
  "moment-to",
  "moment-to-now",
  "moment-duration",
  "moment-calendar",
  "moment-diff",

  "outlet",

  "is-before",
  "is-after",
  "is-same",
  "is-same-or-before",
  "is-same-or-after",
  "is-between",
  "now",
  "unix",

  //cp-validations
  "v-get",

  //route-action
  "route-action",

  // composable-helpers
  "map-by",
  "sort-by",
  "filter-by",
  "reject-by",
  "find-by",
  "object-at",
  "hasBlock",
  "has-block",
  "has-next",
  "has-previous",
  "group-by",
  "not-eq",
  "is-array",
  "is-empty",
  "is-equal",

  // liquid
  "liquid-unless",
  "liquid-container",
  "liquid-outlet",
  "liquid-versions",
  "liquid-bind",
  "liquid-spacer",
  "liquid-sync",
  "liquid-measured",
  "liquid-child",
  "liquid-if",

  //app-version
  "app-version"
];

const isAttribute = key => {
  return HTML_ATTRIBUTES.includes(key) || key.startsWith('data-');
}

/**
 *  Returns a capitalized tagname for angle brackets syntax
 *  {{my-component}} => MyComponent
 */
const capitalizedTagName = tagname => {
  return tagname
    .split("-")
    .map(s => {
      return s[0].toUpperCase() + s.slice(1);
    })
    .join("");
};

const transformTagName = tagName => {
  if (tagName.includes('.')) {
    return tagName;
  }

  if (tagName.includes('/')) {
    return transformNestedTagName(tagName);
  }

  return capitalizedTagName(tagName)
};

const transformNestedTagName = tagName => {
  const paths = tagName.split('/');
  return paths.map(name => capitalizedTagName(name)).join('::');
};

const transformNestedSubExpression = subExpression => {
  let positionalArgs = subExpression.params.map(param => {
    if (param.type === "SubExpression") {
      return transformNestedSubExpression(param);
    } else {
      return param.original;
    }
  });

  let namedArgs = [];
  if (subExpression.hash.pairs.length > 0) {
    namedArgs = subExpression.hash.pairs.map(pair => {
      if (pair.value.type === "SubExpression") {
        let nestedValue = transformNestedSubExpression(pair.value);
        return `${pair.key}=${nestedValue}`;
      } else {
        if(pair.value.type === "StringLiteral") {
          return `${pair.key}="${pair.value.original}"`;
        }
        return `${pair.key}=${pair.value.original}`;
      }
    });
  }

  let args = positionalArgs.concat(namedArgs);
  return `(${subExpression.path.original} ${args.join(" ")})`;
}

/**
 * exports
 *
 * @param fileInfo
 * @param api
 * @param options
 * @returns {undefined}
 */
module.exports = function(fileInfo, api, options) {
  const ast = glimmer.preprocess(fileInfo.source);
  const b = glimmer.builders;
  const config = new Config(options);

  /**
   * Transform the attributes names & values properly 
   */
  const transformAttrs = attrs => {

    return attrs.map(a => {
      let _key = a.key;
      let _valueType = a.value.type;
      let _value;
      if (!isAttribute(a.key)) {
        _key = "@" + _key;
      }

      if (_valueType === "PathExpression") {
        _value = b.mustache(b.path(a.value.original));
      } else if (_valueType === "SubExpression") {
        if (a.value.hash.pairs.length > 0) {
          _value = b.mustache(a.value.path.original, a.value.params, a.value.hash)
        } else {
          const params = a.value.params.map(p => {
            if(p.type === "SubExpression") {
              return transformNestedSubExpression(p)
            } else if(p.type === "StringLiteral") {
              return  `"${p.original}"` ;
            } else {
              return p.original
            }
          }).join(" ");

          _value = b.mustache(b.path(a.value.path.original + " " + params));
        }

      } else if(_valueType === "BooleanLiteral") {
       _value = b.mustache(b.boolean(a.value.original))
      } else {
        _value = b.text(a.value.original);
      }

      return b.attr(_key, _value);
    });
  };

  const transformLinkToAttrs = params => {
    let attributes = [];

    if (params.length === 1) {
      // @route param
      attributes = [b.attr("@route", b.text(params[0].value))];
    } else if (params.length === 2) {
      // @route and @model param
      let [route, model] = params;
      let _routeParam = b.attr("@route", b.text(route.value));

      if (model.type === "SubExpression") {
        let _queryParam = b.attr("@query", b.mustache(b.path("hash"), [], model.hash));
        attributes = [_routeParam, _queryParam];
      } else {
        let _modelParam = b.attr("@model", b.mustache(model.original));
        attributes = [_routeParam, _modelParam];
      }
    } else if (params.length > 2) {
      // @route and @models params
      let [route, ...models] = params;
      let _routeParam = b.attr("@route", b.text(route.value));
      let _modelsParam = b.attr("@models", b.mustache(b.path("array"), models));
      attributes = [_routeParam, _modelsParam];
    }

    return attributes;
  };

  const tranformValuelessDataParams = params => {
    let valuelessDataParams = params.filter(param => param.original.startsWith('data-'));
    let valuelessDataAttributes = valuelessDataParams.map(param => b.attr(param.parts[0], b.mustache("true")));
    return valuelessDataAttributes;
  };

  const transformNodeAttributes = node => {
    let params = tranformValuelessDataParams(node.params);
    let attributes = transformAttrs(node.hash.pairs);

    return params.concat(attributes);
  }

  const shouldIgnoreMustacheStatement = (name) => {
    return IGNORE_MUSTACHE_STATEMENTS.includes(name) || config.helpers.includes(name);
  }

  glimmer.traverse(ast, {

    MustacheStatement(node) {
      // Don't change attribute statements
      const isValidMustache = node.loc.source !== "(synthetic)" && !shouldIgnoreMustacheStatement(node.path.original);
      if (isValidMustache && node.hash.pairs.length > 0) {
        const tagName = node.path.original;
        const newTagName = transformTagName(tagName);
        const attributes = transformNodeAttributes(node);

        return b.element(
          { name: newTagName, selfClosing: true }, 
          { attrs: attributes }
        );
      }
    },

    BlockStatement(node) {
      if (!shouldIgnoreMustacheStatement(node.path.original)) {
        const tagName = node.path.original;

        // Handling Angle Bracket Invocations For Built-in Components based on RFC-0459
        // https://github.com/emberjs/rfcs/blob/32a25b31d67d67bc7581dd0bead559063b06f076/text/0459-angle-bracket-built-in-components.md
        
        let attributes = [];

        if(tagName === 'link-to') {
          attributes = transformLinkToAttrs(node.params);
        } else {
          attributes = transformNodeAttributes(node);
        }

        const newTagName = transformTagName(tagName);

        return b.element(newTagName, {
          attrs: attributes,
          children: node.program.body,
          blockParams: node.program.blockParams
        });
      }
    }

  });
  let uglySource = glimmer.print(ast);
  return prettier.format(uglySource, { parser: "glimmer" });
};
