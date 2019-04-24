const glimmer = require('@glimmer/syntax');
const prettier = require("prettier");

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
 */
const IGNORE_MUSTACHE_STATEMENTS = [ 
  "hash",
  "t"
];

/**
 * Ignore the following list of BlockStatements from transform
 */
const ignoreBlocks = [
  "each",
  "if",
  "unless",
  "let",
  "each-in"
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
  let values;

  if (subExpression.hash.pairs.length > 0) { //hash eg. `(hash name="Ben")`
    values = subExpression.hash.pairs.map(pair => {
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
  } else { //params eg. `(add 1 2)`
    values = subExpression.params.map(param => {
      if (param.type === "SubExpression") {
        return transformNestedSubExpression(param);
      } else {
        return param.original;
      }
    });
  }

  return `(${subExpression.path.original} ${values.join(" ")})`;
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
          _value = b.mustache(a.value.path.original, [], a.value.hash)
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


  glimmer.traverse(ast, {

    MustacheStatement(node) {
      // Don't change attribute statements
      const isValidMustache = node.loc.source !== "(synthetic)" && !IGNORE_MUSTACHE_STATEMENTS.includes(node.path.original);
      if (isValidMustache && node.hash.pairs.length > 0) {
        const tagName = node.path.original;
        const newTagName = transformTagName(tagName);
        const attributes = transformAttrs(node.hash.pairs);

        return b.element(
          { name: newTagName, selfClosing: true }, 
          { attrs: attributes }
        );
      }
    },

    BlockStatement(node) {
      if (!ignoreBlocks.includes(node.path.original)) {
        const tagName = node.path.original;

        // Handling Angle Bracket Invocations For Built-in Components based on RFC-0459
        // https://github.com/emberjs/rfcs/blob/32a25b31d67d67bc7581dd0bead559063b06f076/text/0459-angle-bracket-built-in-components.md
        
        let attributes = [];

        if(tagName === 'link-to') {
          attributes = transformLinkToAttrs(node.params);
        } else {
          attributes = transformAttrs(node.hash.pairs);

          if (node.params) {
            attributes = attributes.concat(tranformValuelessDataParams(node.params));
          }
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
