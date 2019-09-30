'use strict';

const stripIndent = require('strip-indent');

const transform = require('./transform');

function runTest(path, source, options) {
  // trim leading line break
  if (source[0] === '\n') {
    source = source.slice(1);
  }
  // trim trailing line break and indent
  if (source.slice(source.length - 3) === '\n  ') {
    source = source.slice(0, source.length - 3);
  }

  let input = stripIndent(source);
  let output = transform({ path, source: input }, options);
  return `${input}\n~~~~~~~~\n${output}`;
}

test('action-params', () => {
  let input = `
    {{#bs-button onClick=(action "submit")}}
      Button
    {{/bs-button}}
  `;

  expect(runTest('action-params.hbs', input)).toMatchSnapshot();
});

test('actions', () => {
  let input = `
    {{#bs-button-group
      value=buttonGroupValue
      type="checkbox"
      onChange=(action (mut buttonGroupValue)) as |bg|
    }}
      {{#bg.button value=1}}1{{/bg.button}}
      {{#bg.button value=2}}2{{/bg.button}}
      {{#bg.button value=3}}3{{/bg.button}}
    {{/bs-button-group}}
  `;

  expect(runTest('actions.hbs', input)).toMatchSnapshot();
});

test('boolean-values', () => {
  let input = `
    {{my-component prop1=true prop2=false}}
  `;

  expect(runTest('true-values.hbs', input)).toMatchSnapshot();
});

test('curly', () => {
  let input = `
    <div>{{foo}}</div>
    <div>{{{bar}}}</div>
  `;

  expect(runTest('curly.hbs', input)).toMatchSnapshot();
});

test('data-attributes', () => {
  let input = `
    {{x-foo data-foo=true}}
    {{x-foo data-test-selector=true}}
    {{x-foo data-test-selector=post.id}}
    {{x-foo label="hi" data-test-selector=true}}
    {{x-foo data-test-foo }}
    
    {{#x-foo data-foo=true}}
      block
    {{/x-foo}}
    
    {{#x-foo data-test-selector=true}}
      block
    {{/x-foo}}
    
    {{#x-foo data-test-selector=post.id}}
      block
    {{/x-foo}}
    
    {{#common/accordion-component data-test-accordion as |accordion|}}
      block
    {{/common/accordion-component}}
    
    {{x-foo
      data-foo
      name="Sophie"
    }}
  `;

  expect(runTest('data-attributes.hbs', input)).toMatchSnapshot();
});

test('deeply-nested-sub', () => {
  let input = `
    {{#some-component class=(concat foo (some-helper ted (some-dude bar (a b c)))) }} 
      help 
    {{/some-component}}
    {{deep-component class=(concat foo (nice-helper ted (some-crazy bar (a d (d e f)))))}}
    {{some-component
      class=(concat foo (some-helper bar))
    }}
    {{some-component
      class=(concat foo (some-helper bar quuz))
    }}
    {{some-component person=(hash name="Sophie" age=1) message=(t "welcome" count=1)}}
    {{some-component
      people=(array
        (hash
          name="Alex"
          age=5
          nested=(hash oldest=true amount=(format-currency 350 sign="£"))
          disabled=(eq foo "bar")
        )
        (hash name="Ben" age=4)
        (hash name="Sophie" age=1)
      )
    }}
  `;

  expect(runTest('deeply-nested-sub.hbs', input)).toMatchSnapshot();
});

test('each-in', () => {
  let input = `
    {{#each-in this.people as |name person|}}
      Hello, {{name}}! You are {{person.age}} years old.
    {{else}}
      Sorry, nobody is here.
    {{/each-in}}
  `;

  expect(runTest('each-in.hbs', input)).toMatchSnapshot();
});

test('entities', () => {
  let input = `
    &lt; &gt; &times;
    {{#foo data-a="&quot;Foo&nbsp;&amp;&nbsp;Bar&quot;"}}&nbsp;Some text &gt;{{/foo}}
  `;

  expect(runTest('entities.hbs', input)).toMatchSnapshot();
});

test('html-tags', () => {
  let input = `
    <input 
      type='text'
      value={{userValue}}
      oninput={{action 'change' value='target.value'}}
      class="{{if invalid 'invalid-input'}}"/>
    
    <textarea 
      value={{userValue}}
      oninput={{action 'change' value='target.value'}}
      class="{{if invalid 'invalid-input'}}">HI</textarea>
    
    <textarea 
      value={{userValue}}
      oninput={{action (action 'change') value='target.value'}}
      class="{{if invalid 'invalid-input'}}">HI</textarea>
    
    <div onclick={{action "clickMe"}}></div>
    
    <div data-foo="{{if someThing yas nah}}"></div>
    <div {{on 'click' this.foo}}></div>
  `;

  expect(runTest('html-tags.hbs', input)).toMatchSnapshot();
});

test('if', () => {
  let input = `
    {{#if (eq a b)}}
      {{my-component1 prop1="hello"}}
    {{else}}
      {{my-component2 prop2="world"}}
    {{/if}}
  `;

  expect(runTest('if.hbs', input)).toMatchSnapshot();
});

test('input-helper', () => {
  let input = `
    {{input type="checkbox" name="email-opt-in" checked=this.model.emailPreference}}
  `;

  expect(runTest('input-helper.hbs', input)).toMatchSnapshot();
});

test('let', () => {
  let input = `
    {{#let (capitalize this.person.firstName) (capitalize this.person.lastName)
      as |firstName lastName|
    }}
      Welcome back {{concat firstName ' ' lastName}}
    
      Account Details:
      First Name: {{firstName}}
      Last Name: {{lastName}}
    {{/let}}
  `;

  expect(runTest('let.hbs', input)).toMatchSnapshot();
});

test('link-to', () => {
  let input = `
    {{#link-to "about"}}About Us{{/link-to}}
    {{#link-to this.dynamicRoute}}About Us{{/link-to}}
  `;

  expect(runTest('link-to.hbs', input)).toMatchSnapshot();
});

test('link-to-inline', () => {
  let input = `
    {{link-to 'Title' 'some.route'}}
    {{link-to
      'Segments'
      'apps.segments'
      class='tabs__discrete-tab'
      activeClass='o__selected'
      current-when='apps.segments'
      data-test-segment-link='segments'
    }}
    {{link-to
      'Segments'
      this.dynamicPath
      class='tabs__discrete-tab'
      activeClass='o__selected'
      current-when='apps.segments'
      data-test-segment-link='segments'
    }}
    {{link-to 
      segment.name 
      'apps.app.companies.segments.segment' 
      segment 
      class="t__em-link"
    }}
  `;

  expect(runTest('link-to-inline.hbs', input)).toMatchSnapshot();
});

test('link-to-model', () => {
  let input = `
    {{#link-to "post" post}}Read {{post.title}}...{{/link-to}}
    {{#link-to "post" "string-id"}}Read {{post.title}}...{{/link-to}}
    {{#link-to "post" 557}}Read {{post.title}}...{{/link-to}}
  `;

  expect(runTest('link-to-model.hbs', input)).toMatchSnapshot();
});

test('link-to-model-array', () => {
  let input = `
    {{#link-to "post.comment" post comment}}
      Comment by {{comment.author.name}} on {{comment.date}}
    {{/link-to}}
    {{#link-to this.dynamicPath post comment}}
      Comment by {{comment.author.name}} on {{comment.date}}
    {{/link-to}}
  `;

  expect(runTest('link-to-model-array.hbs', input)).toMatchSnapshot();
});

test('link-to-query-param', () => {
  let input = `
    {{#link-to "posts" (query-params direction="desc" showArchived=false)}}
      Recent Posts
    {{/link-to}}
    {{#link-to data-test-foo "posts"}}
      Recent Posts
    {{/link-to}}
    {{#link-to this.dynamicPath (query-params direction="desc" showArchived=false)}}
      Recent Posts
    {{/link-to}}
    {{#link-to data-test-foo this.dynamicPath (query-params direction="desc" showArchived=false)}}
      Recent Posts
    {{/link-to}}
    {{#link-to (query-params direction="desc" showArchived=false)}}
      Recent Posts
    {{/link-to}}
    {{link-to
      'Users'
      'apps.app.users.segments.segment'
      'all-users'
      (query-params searchTerm=searchTerm)
    }}
  `;

  expect(runTest('link-to-query-param.hbs', input)).toMatchSnapshot();
});

test('nested', () => {
  let input = `
    {{ui/site-header user=this.user class=(if this.user.isAdmin "admin")}}
    {{ui/button text="Click me"}}
    {{#some-path/another-path/super-select selected=this.user.country as |s|}}
      {{#each this.availableCountries as |country|}}
        {{#s.option value=country}}{{country.name}}{{/s.option}}
      {{/each}}
    {{/some-path/another-path/super-select}}
    {{x-foo/x-bar}}
  `;

  expect(runTest('nested.hbs', input)).toMatchSnapshot();
});

test('null-subexp', () => {
  let input = `
    {{some-component selected=(is-equal this.bar null)}}
  `;

  expect(runTest('null-subexp.hbs', input)).toMatchSnapshot();
});

test('positional-params', () => {
  let input = `
    {{some-component "foo"}}
    {{#some-component "foo"}}
      hi
    {{/some-component}}
    {{#some-component foo}}
      hi
    {{/some-component}}
    {{some-component 123}}
    {{some-component (some-helper 987)}}
  `;

  expect(runTest('positional-params.hbs', input)).toMatchSnapshot();
});

test('sample', () => {
  let input = `
    {{site-header user=this.user class=(if this.user.isAdmin "admin")}}
    {{site-header user=null address=undefined}}

    {{#super-select selected=this.user.country as |s|}}
      {{#each this.availableCountries as |country|}}
        {{#s.option value=country}}{{country.name}}{{/s.option}}
      {{/each}}
    {{/super-select}}

    {{foo/bar tagName=''}}
    {{foo tagName='div' a="" b=''}}
  `;

  expect(runTest('sample.hbs', input)).toMatchSnapshot();
});

test('sample2', () => {
  let input = `
    {{#my-card as |card|}}
      {{card.title title="My Card Title"}}
      {{#card.content}}
        <p>hello</p>
      {{/card.content}}
      {{card.foo-bar}}
      {{card.foo}}
    {{/my-card}}
  `;

  expect(runTest('sample2.hbs', input)).toMatchSnapshot();
});

test('t-helper', () => {
  let input = `
    {{t "some.string" param="string" another=1}}
  `;

  expect(runTest('t-helper.hbs', input)).toMatchSnapshot();
});

test('tag-name', () => {
  let input = `
    {{foo/bar name=""}}
  `;

  expect(runTest('tag-name.hbs', input)).toMatchSnapshot();
});

test('textarea', () => {
  let input = `
    {{textarea value=this.model.body}}
  `;

  expect(runTest('textarea.hbs', input)).toMatchSnapshot();
});

test('tilde', () => {
  let input = `
    {{#if foo~}}
      bar
    {{/if}}
  `;

  expect(runTest('tilde.hbs', input)).toMatchSnapshot();
});

test('undefined-subexp', () => {
  let input = `
    {{some-component selected=(is-equal this.bar undefined)}}
  `;

  expect(runTest('undefined-subexp.hbs', input)).toMatchSnapshot();
});

test('unless', () => {
  let input = `
    {{#unless this.hasPaid}}
      You owe: \${{this.total}}
    {{/unless}}
  `;

  expect(runTest('unless.hbs', input)).toMatchSnapshot();
});

test('skip-default-helpers', () => {
  let input = `
    <div id="main-container">
      {{liquid-outlet}}
    </div>
    <button {{action "toggle" "showA"}}>
      Toggle A/B</button>
    <button {{action "toggle" "showOne"}}>
      Toggle One/Two
    </button>
    {{#liquid-if showOne class="nested-explode-transition-scenario"}}
      <div class="child">
        {{#liquid-if showA use="toLeft"}}
          <div class="child-one-a">One: A</div>
        {{else}}
          <div class="child-one-b">One: B</div>
        {{/liquid-if}}
      </div>
    {{else}}
      <div class="child child-two">
        Two
      </div>
    {{/liquid-if}}
    {{moment '12-25-1995' 'MM-DD-YYYY'}}
    {{moment-from '1995-12-25' '2995-12-25' hideAffix=true}}
    {{some-component foo=true}}
    {{some-helper1 foo=true}}
    {{some-helper2 foo=true}}
  `;

  let options = {
    helpers: ['some-helper1', 'some-helper2', 'some-helper3'],
  };

  expect(runTest('skip-default-helpers.hbs', input, options)).toMatchSnapshot();
});

test('skip-default-helpers (no-config)', () => {
  let input = `
    <div id="main-container">
      {{liquid-outlet}}
    </div>
    <button {{action "toggle" "showA"}}>
      Toggle A/B</button>
    <button {{action "toggle" "showOne"}}>
      Toggle One/Two
    </button>
    {{#liquid-if showOne class="nested-explode-transition-scenario"}}
      <div class="child">
        {{#liquid-if showA use="toLeft"}}
          <div class="child-one-a">One: A</div>
        {{else}}
          <div class="child-one-b">One: B</div>
        {{/liquid-if}}
      </div>
    {{else}}
      <div class="child child-two">
        Two
      </div>
    {{/liquid-if}}
    {{moment '12-25-1995' 'MM-DD-YYYY'}}
    {{moment-from '1995-12-25' '2995-12-25' hideAffix=true}}
    {{some-component foo=true}}
    {{some-helper1 foo=true}}
    {{some-helper2 foo=true}}
  `;

  expect(runTest('skip-default-helpers.hbs', input)).toMatchSnapshot();
});

test('custom-options', () => {
  let input = `
    {{some-component foo=true}}
    {{some-helper1 foo=true}}
    {{some-helper2 foo=true}}
    {{link-to "Title" "some.route"}}
    {{textarea value=this.model.body}}
    {{input type="checkbox" name="email-opt-in" checked=this.model.emailPreference}}
  `;

  let options = {
    helpers: ['some-helper1', 'some-helper2', 'some-helper3'],
    skipBuiltInComponents: true,
  };

  expect(runTest('custom-options.hbs', input, options)).toMatchSnapshot();
});
