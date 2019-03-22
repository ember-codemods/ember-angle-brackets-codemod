const glimmer = require('@glimmer/syntax');
const prettier = require("prettier");


/**
 * 
 *
 * List of HTML attributes for which @ should not be appended
 */
const HTML_ATTRIBUTES = [
  "class",
  "placeholder",
  "required"
];

/**
 * Ignore the following list of BlockStatements from transform
 */
const ignoreBlocks = [
  "each",
  "if",
  "unless",
  "let",
  "each-in",
  "link-to"
];


/**
 *  Returns a capitalized tagname for angle brackets syntax
 *  {{my-component}} => MyComponent
 * 
 */
const capitalizedTagName = tagname => {
  return tagname
    .split("-")
    .map(s => {
      return s[0].toUpperCase() + s.slice(1);
    })
    .join("");
};

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
   *
   * 
   */
  const transformAttrs = attrs => {
    return attrs.map(a => {
      let _key = a.key;
      let _valueType = a.value.type;
      let _value;
      if (!HTML_ATTRIBUTES.includes(a.key)) {
        _key = "@" + _key;
      }

      if (_valueType === "PathExpression") {
        _value = b.mustache(b.path(a.value.original));
      } else if (_valueType === "SubExpression") {

        const params = a.value.params.map(p => {
          if(p.type === "SubExpression") {
            return "(" + p.path.original + " " + p.params.map(p => p.original) + ")";
          } else if(p.type === "StringLiteral") {
            return  `"${p.original}"` ;
          } else {
            return p.original
          }
        }).join(" ");

        _value = b.mustache(b.path(a.value.path.original + " " + params));

      } else if(_valueType === "BooleanLiteral") {
       _value = b.mustache(b.boolean(a.value.original))
      } else {
        _value = b.text(a.value.original);
      }

      return b.attr(_key, _value);
    });
  };


  glimmer.traverse(ast, {
    MustacheStatement(node) {
      // Don't change attribute statements
      if (node.loc.source !== "(synthetic)" && node.hash.pairs.length > 0) {
        const tagName = node.path.original;
        const _capitalizedTagName = capitalizedTagName(tagName);
        const attributes = transformAttrs(node.hash.pairs);

        return b.element(
          { name: _capitalizedTagName, selfClosing: true }, 
          { attrs: attributes }
        );
      }
    },
    BlockStatement(node) {
      if (!ignoreBlocks.includes(node.path.original)) {

        const tagName = node.path.original;
        let newTagName = tagName.includes('.') ? tagName : capitalizedTagName(tagName);
        let attributes = transformAttrs(node.hash.pairs);

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
