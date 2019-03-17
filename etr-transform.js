const templateRecast = require('ember-template-recast');
const template = `
{{site-header user=this.user class=(if this.user.isAdmin "admin")}}

{{#super-select selected=this.user.country as |s|}}
  {{#each this.availableCountries as |country|}}
    {{#s.option value=country}}{{country.name}}{{/s.option}}
  {{/each}}
{{/super-select}}
  `;
const HTML_ATTRIBUTES = [
  "class",
  "value",
  "title",
  "label",
  "placeholder",
  "required",
];

const ignoreBlocks = [
"each",
  "if",
  "input",
  "textarea",
  "link-to"
];

const capitalizedTagName = tagname =>
  tagname
    .split("-")
    .map(s => {
      return s[0].toUpperCase() + s.slice(1);
    })
    .join("");


let { code } = templateRecast.transform(template, env => {
  let { builders: b, traverse } = env.syntax;
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
    MustacheStatement(node) {
      // Don't change attribute statements
      if (node.loc.source !== "(synthetic)" && node.hash.pairs.length > 0) {
        const tagname = node.path.original;
        const _capitalizedTagName = capitalizedTagName(tagname);
        const attributes = transformAttrs(node.hash.pairs);

        return b.element(
          { name: _capitalizedTagName, selfClosing: true }, 
          { attrs: attributes }
        );
      }
    },

    BlockStatement(node) {
      //console.log(util.inspect(node));
      let childNodes = [];
      traverse(node.program, {
        All: {
          enter(node) {
            childNodes.push(node);
          }
        }
      });

      childNodes.forEach(n => console.log(n.type));
      //console.log(childNodes);
      //if (!ignoreBlocks.includes(node.path.original)) {

        const tagname = node.path.original;
        let _capitalizedTagName = capitalizedTagName(tagname);
        let attributes = transformAttrs(node.hash.pairs);
        debugger

        return b.element(_capitalizedTagName, 
          { attrs: attributes ,  children: node.program.body ,  blockParams: node.program.blockParams }
      );
    //}
  }
};
});
console.log(code);

