const HTML_ATTRIBUTES = [
  "class",
  "value",
  "title",
  "label",
  "placeholder",
  "required"
];

const ignoreBlocks = [
  "each",
  "if"
];

const capitalizedTagName = tagname =>
  tagname
    .split("-")
    .map(s => {
      return s[0].toUpperCase() + s.slice(1);
    })
    .join("");

module.exports = function({ plugins, syntax }) {
  const { parse, print, builders, traverse, Walker } = syntax;
  const b = builders;

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
        const params = a.value.params.map(p => p.original).join(" ");
        _value = b.mustache(b.path(a.value.path.original + " " + params));
      } else {
        _value = b.text(a.value.original);
      }

      return b.attr(_key, _value);
    });
  };

  return {
    name: "ast-transform",

    visitor: {

      MustacheStatement(node) {
        // Don't change attribute statements
        if (node.loc.source !== "(synthetic)" && node.hash.pairs.length > 0) {
          const tagname = node.path.original;
          const _capitalizedTagName = capitalizedTagName(tagname);
          const attributes = transformAttrs(node.hash.pairs);

          return b.element(_capitalizedTagName, { attrs: attributes });
        }
      },

      BlockStatement(node) {
        if (!ignoreBlocks.includes(node.path.original)) {

          const tagname = node.path.original;
          let _capitalizedTagName = capitalizedTagName(tagname);
          let attributes = transformAttrs(node.hash.pairs);

          return b.element(_capitalizedTagName, {
            attrs: attributes,
            children: node.program.body,

            blockParams: node.program.blockParams
          });
        }
      }
    }
  };
};
