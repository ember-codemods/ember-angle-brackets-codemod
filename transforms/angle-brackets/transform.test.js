'use strict';

const transform = require('./transform');
const invokableData = require('./telemetry/mock-invokables');
const { getInvokableData } = require('./telemetry/invokable');

function runTest(path, source, options) {
  return transform({ path, source }, options, getInvokableData(invokableData));
}
function runTestWithData(path, source, options, data) {
  return transform({ path, source }, options, data);
}

test('action-params', () => {
  let input = `
    {{#bs-button onClick=(action "submit")}}
      Button
    {{/bs-button}}
  `;

  expect(runTest('action-params.hbs', input)).toMatchInlineSnapshot(`
    "
        <BsButton @onClick={{action \\"submit\\"}}>
          Button
        </BsButton>
      "
  `);
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

  /**
   * NOTE: An issue has been opened in `ember-template-recast` (https://github.com/ember-template-lint/ember-template-recast/issues/82)
   * regarding to create an API to allow a transform to customize the whitespace for newly created nodes.
   *
   */
  expect(runTest('actions.hbs', input)).toMatchInlineSnapshot(`
    "
        <BsButtonGroup @value={{buttonGroupValue}} @type=\\"checkbox\\" @onChange={{action (mut buttonGroupValue)}} as |bg|>
          <bg.button @value={{1}}>1</bg.button>
          <bg.button @value={{2}}>2</bg.button>
          <bg.button @value={{3}}>3</bg.button>
        </BsButtonGroup>
      "
  `);
});

test('boolean-values', () => {
  let input = `
    {{my-component prop1=true prop2=false}}
  `;

  expect(runTest('true-values.hbs', input)).toMatchInlineSnapshot(`
    "
        <MyComponent @prop1={{true}} @prop2={{false}} />
      "
  `);
});

test('curly', () => {
  let input = `
    <div>{{foo}}</div>
    <div>{{{bar}}}</div>
  `;

  expect(runTest('curly.hbs', input)).toMatchInlineSnapshot(`
    "
        <div>{{foo}}</div>
        <div>{{{bar}}}</div>
      "
  `);
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

  expect(runTest('data-attributes.hbs', input)).toMatchInlineSnapshot(`
    "
        <XFoo @data-foo={{true}} />
        <XFoo @data-test-selector={{true}} />
        <XFoo @data-test-selector={{post.id}} />
        <XFoo @label=\\"hi\\" @data-test-selector={{true}} />
        {{x-foo data-test-foo }}

        <XFoo @data-foo={{true}}>
          block
        </XFoo>

        <XFoo @data-test-selector={{true}}>
          block
        </XFoo>

        <XFoo @data-test-selector={{post.id}}>
          block
        </XFoo>

        {{#common/accordion-component data-test-accordion as |accordion|}}
          block
        {{/common/accordion-component}}

        {{x-foo
          data-foo
          name=\\"Sophie\\"
        }}
      "
  `);
});

test('data-test-attributes', () => {
  let options = {
    includeValuelessDataTestAttributes: true,
  };
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
    {{#link-to data-test-foo "posts"}}
      Recent Posts
    {{/link-to}}
    {{#link-to data-test-foo this.dynamicPath (query-params direction="desc" showArchived=false)}}
      Recent Posts
    {{/link-to}}
    {{#link-to data-test-foo data-foo this.dynamicPath (query-params direction="desc" showArchived=false)}}
      Recent Posts
    {{/link-to}}

    {{x-foo
      data-foo
      name="Sophie"
    }}
    {{#x-foo data-foo}}
      block
    {{/x-foo}}
    {{#common/accordion-component data-accordion as |accordion|}}
      block
    {{/common/accordion-component}}
    {{#link-to data-foo "posts"}}
      Recent Posts
    {{/link-to}}
    {{#link-to data-foo this.dynamicPath (query-params direction="desc" showArchived=false)}}
      Recent Posts
    {{/link-to}}
  `;

  expect(runTest('data-test-attributes.hbs', input, options)).toMatchInlineSnapshot(`
    "
        <XFoo @data-foo={{true}} />
        <XFoo @data-test-selector={{true}} />
        <XFoo @data-test-selector={{post.id}} />
        <XFoo @label=\\"hi\\" @data-test-selector={{true}} />
        <XFoo data-test-foo />
        <XFoo @data-foo={{true}}>
          block
        </XFoo>
        <XFoo @data-test-selector={{true}}>
          block
        </XFoo>
        <XFoo @data-test-selector={{post.id}}>
          block
        </XFoo>
        <Common::AccordionComponent data-test-accordion as |accordion|>
          block
        </Common::AccordionComponent>
        <LinkTo @route=\\"posts\\" data-test-foo>
          Recent Posts
        </LinkTo>
        <LinkTo @route={{this.dynamicPath}} @query={{hash direction=\\"desc\\" showArchived=false}} data-test-foo>
          Recent Posts
        </LinkTo>
        <LinkTo @route={{this.dynamicPath}} @query={{hash direction=\\"desc\\" showArchived=false}} data-test-foo data-foo>
          Recent Posts
        </LinkTo>

        {{x-foo
          data-foo
          name=\\"Sophie\\"
        }}
        {{#x-foo data-foo}}
          block
        {{/x-foo}}
        {{#common/accordion-component data-accordion as |accordion|}}
          block
        {{/common/accordion-component}}
        {{#link-to data-foo \\"posts\\"}}
          Recent Posts
        {{/link-to}}
        {{#link-to data-foo this.dynamicPath (query-params direction=\\"desc\\" showArchived=false)}}
          Recent Posts
        {{/link-to}}
      "
  `);
});

test('deeply-nested-sub', () => {
  let input = `
    {{#some-component class=(concat foo (some-helper ted (some-dude bar (a b c)))) }}
      help
    {{/some-component}}
    {{some-component class=(concat foo (some-helper ted (some-dude bar (a b c)))) }}
    {{deep-component class=(concat foo (nice-helper ted (some-crazy bar (a d (d e f)))))}}
    {{some-component
      class=(concat foo (some-helper bar))
    }}
    {{some-component
      class=(concat foo (some-helper bar quuz))
    }}
    {{some-component
      person=(hash name="Sophie" age=1)
      message=(t "welcome" count=1)
    }}
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

  /**
   * NOTE: An issue has been opened in `ember-template-recast` (https://github.com/ember-template-lint/ember-template-recast/issues/82)
   * regarding to create an API to allow a transform to customize the whitespace for newly created nodes.
   *
   */
  expect(runTest('deeply-nested-sub.hbs', input)).toMatchInlineSnapshot(`
    "
        <SomeComponent @class={{concat foo (some-helper ted (some-dude bar (a b c)))}}>
          help
        </SomeComponent>
        <SomeComponent @class={{concat foo (some-helper ted (some-dude bar (a b c)))}} />
        <DeepComponent @class={{concat foo (nice-helper ted (some-crazy bar (a d (d e f))))}} />
        <SomeComponent @class={{concat foo (some-helper bar)}} />
        <SomeComponent @class={{concat foo (some-helper bar quuz)}} />
        <SomeComponent @person={{hash name=\\"Sophie\\" age=1}} @message={{t \\"welcome\\" count=1}} />
        <SomeComponent @people={{array (hash name=\\"Alex\\" age=5 nested=(hash oldest=true amount=(format-currency 350 sign=\\"£\\")) disabled=(eq foo \\"bar\\")) (hash name=\\"Ben\\" age=4) (hash name=\\"Sophie\\" age=1)}} />
      "
  `);
});

test('each-in', () => {
  let input = `
    {{#each-in this.people as |name person|}}
      Hello, {{name}}! You are {{person.age}} years old.
    {{else}}
      Sorry, nobody is here.
    {{/each-in}}
  `;

  expect(runTest('each-in.hbs', input)).toMatchInlineSnapshot(`
    "
        {{#each-in this.people as |name person|}}
          Hello, {{name}}! You are {{person.age}} years old.
        {{else}}
          Sorry, nobody is here.
        {{/each-in}}
      "
  `);
});

test('entities', () => {
  let input = `
    &lt; &gt; &times;
    {{#foo data-a="&quot;Foo&nbsp;&amp;&nbsp;Bar&quot;"}}&nbsp;Some text &gt;{{/foo}}
  `;

  expect(runTest('entities.hbs', input)).toMatchInlineSnapshot(`
    "
        &lt; &gt; &times;
        <Foo @data-a=\\"&quot;Foo&nbsp;&amp;&nbsp;Bar&quot;\\">&nbsp;Some text &gt;</Foo>
      "
  `);
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
    <div class="" style="margin-bottom:20px" {{action "updateSetup"  on="change"}}></div>
  `;

  expect(runTest('html-tags.hbs', input)).toMatchInlineSnapshot(`
    "
        <input
          type='text'
          value={{userValue}}
          oninput={{action 'change' value='target.value'}}
          class=\\"{{if invalid 'invalid-input'}}\\"/>

        <textarea
          value={{userValue}}
          oninput={{action 'change' value='target.value'}}
          class=\\"{{if invalid 'invalid-input'}}\\">HI</textarea>

        <textarea
          value={{userValue}}
          oninput={{action (action 'change') value='target.value'}}
          class=\\"{{if invalid 'invalid-input'}}\\">HI</textarea>

        <div onclick={{action \\"clickMe\\"}}></div>

        <div data-foo=\\"{{if someThing yas nah}}\\"></div>
        <div {{on 'click' this.foo}}></div>
        <div class=\\"\\" style=\\"margin-bottom:20px\\" {{action \\"updateSetup\\"  on=\\"change\\"}}></div>
      "
  `);
});

test('if', () => {
  let input = `
    {{#if (eq a b)}}
      {{my-component1 prop1="hello"}}
    {{else}}
      {{my-component2 prop2="world"}}
    {{/if}}
  `;

  expect(runTest('if.hbs', input)).toMatchInlineSnapshot(`
    "
        {{#if (eq a b)}}
          <MyComponent1 @prop1=\\"hello\\" />
        {{else}}
          <MyComponent2 @prop2=\\"world\\" />
        {{/if}}
      "
  `);
});

test('nested-else-if', () => {
  let input = `
    {{#if a}}
      {{my-component1 foo="bar"}}
    {{else if b}}
      {{my-component2 foo="bar"}}
    {{else if c}}
      {{my-component3 foo="bar"}}
    {{else if d}}
      {{my-component4 foo="bar"}}
    {{else}}
      {{my-component5 foo="bar"}}
    {{/if}}
  `;

  expect(runTest('if.hbs', input)).toMatchInlineSnapshot(`
    "
        {{#if a}}
          <MyComponent1 @foo=\\"bar\\" />
        {{else if b}}
          <MyComponent2 @foo=\\"bar\\" />
        {{else if c}}
          <MyComponent3 @foo=\\"bar\\" />
        {{else if d}}
          <MyComponent4 @foo=\\"bar\\" />
        {{else}}
          <MyComponent5 @foo=\\"bar\\" />
        {{/if}}
      "
  `);
});

test('input-helper', () => {
  let input = `
    {{input type="checkbox" name="email-opt-in" checked=this.model.emailPreference}}
  `;

  expect(runTest('input-helper.hbs', input)).toMatchInlineSnapshot(`
    "
        <Input @type=\\"checkbox\\" @name=\\"email-opt-in\\" @checked={{this.model.emailPreference}} />
      "
  `);
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

  expect(runTest('let.hbs', input)).toMatchInlineSnapshot(`
    "
        {{#let (capitalize this.person.firstName) (capitalize this.person.lastName)
          as |firstName lastName|
        }}
          Welcome back {{concat firstName ' ' lastName}}

          Account Details:
          First Name: {{firstName}}
          Last Name: {{lastName}}
        {{/let}}
      "
  `);
});

test('link-to', () => {
  let input = `
    {{#link-to "about"}}About Us{{/link-to}}
    {{#link-to "data-access"}}Accessing the Crates.io Data{{/link-to}}
    {{#link-to this.dynamicRoute}}About Us{{/link-to}}
    {{#link-to "user" this.first this.second}}Show{{/link-to}}
    {{#link-to "user" this.first this.second (query-params foo="baz")}}Show{{/link-to}}
    {{#link-to "user" this.first}}Show{{/link-to}}
    {{#link-to "user" this.first (query-params foo="baz")}}Show{{/link-to}}
  `;

  expect(runTest('link-to.hbs', input)).toMatchInlineSnapshot(`
    "
        <LinkTo @route=\\"about\\">About Us</LinkTo>
        <LinkTo @route=\\"data-access\\">Accessing the Crates.io Data</LinkTo>
        <LinkTo @route={{this.dynamicRoute}}>About Us</LinkTo>
        <LinkTo @route=\\"user\\" @models={{array this.first this.second}}>Show</LinkTo>
        <LinkTo @route=\\"user\\" @models={{array this.first this.second}} @query={{hash foo=\\"baz\\"}}>Show</LinkTo>
        <LinkTo @route=\\"user\\" @model={{this.first}}>Show</LinkTo>
        <LinkTo @route=\\"user\\" @model={{this.first}} @query={{hash foo=\\"baz\\"}}>Show</LinkTo>
      "
  `);
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
    {{link-to (t "show") "flight" event.flight.id class="btn btn-default btn-sm pull-right"}}
    {{link-to (t "show") "user" (if linkActor event.actor.id event.user.id)}}
    {{link-to "Show" "user" this.first this.second}}
    {{link-to "Show" "user" this.first this.second (query-params foo="baz")}}
    {{link-to "Show" "user" this.first}}
    {{link-to "Show" "user" this.first (query-params foo="baz")}}
  `;

  /**
   * NOTE: An issue has been opened in `ember-template-recast` (https://github.com/ember-template-lint/ember-template-recast/issues/82)
   * regarding to create an API to allow a transform to customize the whitespace for newly created nodes.
   *
   */
  expect(runTest('link-to-inline.hbs', input)).toMatchInlineSnapshot(`
    "
        <LinkTo @route=\\"some.route\\">Title</LinkTo>
        <LinkTo @route=\\"apps.segments\\" class=\\"tabs__discrete-tab\\" @activeClass=\\"o__selected\\" @current-when=\\"apps.segments\\" data-test-segment-link=\\"segments\\">Segments</LinkTo>
        <LinkTo @route={{this.dynamicPath}} class=\\"tabs__discrete-tab\\" @activeClass=\\"o__selected\\" @current-when=\\"apps.segments\\" data-test-segment-link=\\"segments\\">Segments</LinkTo>
        <LinkTo @route=\\"apps.app.companies.segments.segment\\" @model={{segment}} class=\\"t__em-link\\">{{segment.name}}</LinkTo>
        <LinkTo @route=\\"flight\\" @model={{event.flight.id}} class=\\"btn btn-default btn-sm pull-right\\">{{t \\"show\\"}}</LinkTo>
        <LinkTo @route=\\"user\\" @model={{if linkActor event.actor.id event.user.id}}>{{t \\"show\\"}}</LinkTo>
        <LinkTo @route=\\"user\\" @models={{array this.first this.second}}>Show</LinkTo>
        <LinkTo @route=\\"user\\" @models={{array this.first this.second}} @query={{hash foo=\\"baz\\"}}>Show</LinkTo>
        <LinkTo @route=\\"user\\" @model={{this.first}}>Show</LinkTo>
        <LinkTo @route=\\"user\\" @model={{this.first}} @query={{hash foo=\\"baz\\"}}>Show</LinkTo>
      "
  `);
});

test('link-to-model', () => {
  let input = `
    {{#link-to "post" post}}Read {{post.title}}...{{/link-to}}
    {{#link-to "post" "string-id"}}Read {{post.title}}...{{/link-to}}
    {{#link-to "post" 557}}Read {{post.title}}...{{/link-to}}
  `;
  /**
   * NOTE: An issue has been opened in `ember-template-recast` (https://github.com/ember-template-lint/ember-template-recast/issues/82)
   * regarding to create an API to allow a transform to customize the whitespace for newly created nodes.
   *
   */
  expect(runTest('link-to-model.hbs', input)).toMatchInlineSnapshot(`
    "
        <LinkTo @route=\\"post\\" @model={{post}}>Read {{post.title}}...</LinkTo>
        <LinkTo @route=\\"post\\" @model=\\"string-id\\">Read {{post.title}}...</LinkTo>
        <LinkTo @route=\\"post\\" @model={{557}}>Read {{post.title}}...</LinkTo>
      "
  `);
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

  expect(runTest('link-to-model-array.hbs', input)).toMatchInlineSnapshot(`
    "
        <LinkTo @route=\\"post.comment\\" @models={{array post comment}}>
          Comment by {{comment.author.name}} on {{comment.date}}
        </LinkTo>
        <LinkTo @route={{this.dynamicPath}} @models={{array post comment}}>
          Comment by {{comment.author.name}} on {{comment.date}}
        </LinkTo>
      "
  `);
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
    {{#link-to (concat parentName ".index")
      model.project.id
      model.projectVersion.compactVersion
      model.name
      (query-params anchor=undefined)
      class="tabbed-layout__menu__item"
      activeClass="tabbed-layout__menu__item_selected"
      current-when=(concat parentName ".index")
      data-test-tab="index"
    }}
      <span>Events</span>
    {{/link-to}}
    {{#link-to (concat parentName ".index")
      model.project.id
      model.projectVersion.compactVersion
      model.name
      model.description
      (query-params anchor=undefined)
      class="tabbed-layout__menu__item"
      activeClass="tabbed-layout__menu__item_selected"
      current-when=(concat parentName ".index")
      data-test-tab="index"
    }}
      <span>Events</span>
    {{/link-to}}
  `;
  /**
   * NOTE: An issue has been opened in `ember-template-recast` (https://github.com/ember-template-lint/ember-template-recast/issues/82)
   * regarding to create an API to allow a transform to customize the whitespace for newly created nodes.
   *
   */
  expect(runTest('link-to-query-param.hbs', input)).toMatchInlineSnapshot(`
    "
        <LinkTo @route=\\"posts\\" @query={{hash direction=\\"desc\\" showArchived=false}}>
          Recent Posts
        </LinkTo>
        {{#link-to data-test-foo \\"posts\\"}}
          Recent Posts
        {{/link-to}}
        <LinkTo @route={{this.dynamicPath}} @query={{hash direction=\\"desc\\" showArchived=false}}>
          Recent Posts
        </LinkTo>
        {{#link-to data-test-foo this.dynamicPath (query-params direction=\\"desc\\" showArchived=false)}}
          Recent Posts
        {{/link-to}}
        <LinkTo @query={{hash direction=\\"desc\\" showArchived=false}}>
          Recent Posts
        </LinkTo>
        <LinkTo @route=\\"apps.app.users.segments.segment\\" @model=\\"all-users\\" @query={{hash searchTerm=searchTerm}}>Users</LinkTo>
        <LinkTo @route={{concat parentName \\".index\\"}} @models={{array model.project.id model.projectVersion.compactVersion model.name}} @query={{hash anchor=undefined}} class=\\"tabbed-layout__menu__item\\" @activeClass=\\"tabbed-layout__menu__item_selected\\" @current-when={{concat parentName \\".index\\"}} data-test-tab=\\"index\\">
          <span>Events</span>
        </LinkTo>
        <LinkTo @route={{concat parentName \\".index\\"}} @models={{array model.project.id model.projectVersion.compactVersion model.name model.description}} @query={{hash anchor=undefined}} class=\\"tabbed-layout__menu__item\\" @activeClass=\\"tabbed-layout__menu__item_selected\\" @current-when={{concat parentName \\".index\\"}} data-test-tab=\\"index\\">
          <span>Events</span>
        </LinkTo>
      "
  `);
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

  expect(runTest('nested.hbs', input)).toMatchInlineSnapshot(`
    "
        <Ui::SiteHeader @user={{this.user}} @class={{if this.user.isAdmin \\"admin\\"}} />
        <Ui::Button @text=\\"Click me\\" />
        <SomePath::AnotherPath::SuperSelect @selected={{this.user.country}} as |s|>
          {{#each this.availableCountries as |country|}}
            <s.option @value={{country}}>{{country.name}}</s.option>
          {{/each}}
        </SomePath::AnotherPath::SuperSelect>
        <XFoo::XBar />
      "
  `);
});

test('null-subexp', () => {
  let input = `
    {{some-component selected=(is-equal this.bar null)}}
  `;

  expect(runTest('null-subexp.hbs', input)).toMatchInlineSnapshot(`
    "
        <SomeComponent @selected={{is-equal this.bar null}} />
      "
  `);
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

  expect(runTest('positional-params.hbs', input)).toMatchInlineSnapshot(`
    "
        {{some-component \\"foo\\"}}
        {{#some-component \\"foo\\"}}
          hi
        {{/some-component}}
        {{#some-component foo}}
          hi
        {{/some-component}}
        {{some-component 123}}
        {{some-component (some-helper 987)}}
      "
  `);
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

  expect(runTest('sample.hbs', input)).toMatchInlineSnapshot(`
    "
        <SiteHeader @user={{this.user}} @class={{if this.user.isAdmin \\"admin\\"}} />
        <SiteHeader @user={{null}} @address={{undefined}} />

        <SuperSelect @selected={{this.user.country}} as |s|>
          {{#each this.availableCountries as |country|}}
            <s.option @value={{country}}>{{country.name}}</s.option>
          {{/each}}
        </SuperSelect>

        <Foo::Bar @tagName=\\"\\" />
        <Foo @tagName=\\"div\\" @a=\\"\\" @b=\\"\\" />
      "
  `);
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

  expect(runTest('sample2.hbs', input)).toMatchInlineSnapshot(`
    "
        <MyCard as |card|>
          <card.title @title=\\"My Card Title\\" />
          <card.content>
            <p>hello</p>
          </card.content>
          <card.foo-bar />
          {{card.foo}}
        </MyCard>
      "
  `);
});

test('splattributes', () => {
  let input = `
    {{#wrapper}}
    <div ...attributes>
      {{foo bar="baz"}}
    </div>
    {{/wrapper}}
  `;

  expect(runTest('splattributes.hbs', input)).toMatchInlineSnapshot(`
    "
        <Wrapper>
        <div ...attributes>
          <Foo @bar=\\"baz\\" />
        </div>
        </Wrapper>
      "
  `);
});

test('t-helper', () => {
  let input = `
    {{t "some.string" param="string" another=1}}
  `;

  expect(runTest('t-helper.hbs', input)).toMatchInlineSnapshot(`
    "
        {{t \\"some.string\\" param=\\"string\\" another=1}}
      "
  `);
});

test('tag-name', () => {
  let input = `
    {{foo/bar name=""}}
  `;

  expect(runTest('tag-name.hbs', input)).toMatchInlineSnapshot(`
    "
        <Foo::Bar @name=\\"\\" />
      "
  `);
});

test('textarea', () => {
  let input = `
    {{textarea value=this.model.body}}
  `;

  expect(runTest('textarea.hbs', input)).toMatchInlineSnapshot(`
    "
        <Textarea @value={{this.model.body}} />
      "
  `);
});

test('tilde', () => {
  let input = `
    {{#if foo~}}
      {{some-component}}
    {{/if}}
  `;

  expect(runTest('tilde.hbs', input)).toMatchInlineSnapshot(`
    "
        {{#if foo~}}
          <SomeComponent />
        {{/if}}
      "
  `);
});

test('undefined-subexp', () => {
  let input = `
    {{some-component selected=(is-equal this.bar undefined)}}
  `;

  expect(runTest('undefined-subexp.hbs', input)).toMatchInlineSnapshot(`
    "
        <SomeComponent @selected={{is-equal this.bar undefined}} />
      "
  `);
});

test('unless', () => {
  let input = `
    {{#unless this.hasPaid}}
      You owe: \${{this.total}}
    {{/unless}}
  `;

  expect(runTest('unless.hbs', input)).toMatchInlineSnapshot(`
    "
        {{#unless this.hasPaid}}
          You owe: \${{this.total}}
        {{/unless}}
      "
  `);
});

test('whitespace-control', () => {
  let input = `
    <div>
      {{~both~}}
    </div>
    <div>
      {{~left}}
    </div>
    <div>
      {{right~}}
    </div>
  `;

  expect(runTest('whitespace-control.hbs', input)).toMatchInlineSnapshot(`
    "
        <div>
          {{~both~}}
        </div>
        <div>
          {{~left}}
        </div>
        <div>
          {{right~}}
        </div>
      "
  `);
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

  expect(runTest('skip-default-helpers.hbs', input, options)).toMatchInlineSnapshot(`
    "
        <div id=\\"main-container\\">
          {{liquid-outlet}}
        </div>
        <button {{action \\"toggle\\" \\"showA\\"}}>
          Toggle A/B</button>
        <button {{action \\"toggle\\" \\"showOne\\"}}>
          Toggle One/Two
        </button>
        {{#liquid-if showOne class=\\"nested-explode-transition-scenario\\"}}
          <div class=\\"child\\">
            {{#liquid-if showA use=\\"toLeft\\"}}
              <div class=\\"child-one-a\\">One: A</div>
            {{else}}
              <div class=\\"child-one-b\\">One: B</div>
            {{/liquid-if}}
          </div>
        {{else}}
          <div class=\\"child child-two\\">
            Two
          </div>
        {{/liquid-if}}
        {{moment '12-25-1995' 'MM-DD-YYYY'}}
        {{moment-from '1995-12-25' '2995-12-25' hideAffix=true}}
        <SomeComponent @foo={{true}} />
        {{some-helper1 foo=true}}
        {{some-helper2 foo=true}}
      "
  `);
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

  expect(runTest('skip-default-helpers.hbs', input)).toMatchInlineSnapshot(`
    "
        <div id=\\"main-container\\">
          {{liquid-outlet}}
        </div>
        <button {{action \\"toggle\\" \\"showA\\"}}>
          Toggle A/B</button>
        <button {{action \\"toggle\\" \\"showOne\\"}}>
          Toggle One/Two
        </button>
        {{#liquid-if showOne class=\\"nested-explode-transition-scenario\\"}}
          <div class=\\"child\\">
            {{#liquid-if showA use=\\"toLeft\\"}}
              <div class=\\"child-one-a\\">One: A</div>
            {{else}}
              <div class=\\"child-one-b\\">One: B</div>
            {{/liquid-if}}
          </div>
        {{else}}
          <div class=\\"child child-two\\">
            Two
          </div>
        {{/liquid-if}}
        {{moment '12-25-1995' 'MM-DD-YYYY'}}
        {{moment-from '1995-12-25' '2995-12-25' hideAffix=true}}
        <SomeComponent @foo={{true}} />
        <SomeHelper1 @foo={{true}} />
        <SomeHelper2 @foo={{true}} />
      "
  `);
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

  expect(runTest('custom-options.hbs', input, options)).toMatchInlineSnapshot(`
    "
        <SomeComponent @foo={{true}} />
        {{some-helper1 foo=true}}
        {{some-helper2 foo=true}}
        {{link-to \\"Title\\" \\"some.route\\"}}
        {{textarea value=this.model.body}}
        {{input type=\\"checkbox\\" name=\\"email-opt-in\\" checked=this.model.emailPreference}}
      "
  `);
});

test('specific-components', () => {
  let input = `
    {{some-component foo=true}}
    {{my-component foo=true}}
    {{x-foo foo=true}}
    {{#my-card as |card|}}
      {{card.title title="My Card Title"}}
    {{/my-card}}
  `;

  let options = {
    components: ['some-component', 'x-foo', 'my-card'],
  };

  expect(runTest('specific-components.hbs', input, options)).toMatchInlineSnapshot(`
    "
        <SomeComponent @foo={{true}} />
        {{my-component foo=true}}
        <XFoo @foo={{true}} />
        <MyCard as |card|>
          {{card.title title=\\"My Card Title\\"}}
        </MyCard>
      "
  `);
});

test('skip-attributes', () => {
  let input = `
    {{some-component data-test-foo=true aria-label="bar" foo=true}}
  `;

  let options = {
    skipAttributesThatMatchRegex: ['/data-/gim', '/aria-/gim'],
  };

  expect(runTest('skip-attributes.hbs', input, options)).toMatchInlineSnapshot(`
    "
        <SomeComponent data-test-foo={{true}} aria-label=\\"bar\\" @foo={{true}} />
      "
  `);
});

test('skip-attributes with invalid regex', () => {
  let input = `
    {{some-component data-test-foo=true aria-label="bar" foo=true}}
  `;

  let options = {
    skipAttributesThatMatchRegex: [null],
  };

  expect(runTest('skip-attributes-invalid-regex.hbs', input, options)).toMatchInlineSnapshot(`
    "
        <SomeComponent @data-test-foo={{true}} @aria-label=\\"bar\\" @foo={{true}} />
      "
  `);
});

test('regex-options', () => {
  let input = `
    {{some-component foo=true}}
  `;

  let options = {
    skipFilesThatMatchRegex: /[A-F]oo|[A-Z]ar/gim,
  };

  expect(runTest('regex-options.hbs', input, options)).toMatchInlineSnapshot(`
    "
        {{some-component foo=true}}
      "
  `);
});

test('preserve arguments', () => {
  let input = `
    {{foo-bar class="baz"}}
    {{foo-bar data-baz class="baz"}}
    {{link-to (t "show") "flight" event.flight.id class="btn btn-default btn-sm pull-right"}}
  `;

  expect(runTest('preserve-arguments.hbs', input)).toMatchInlineSnapshot(`
    "
        <FooBar @class=\\"baz\\" />
        {{foo-bar data-baz class=\\"baz\\"}}
        <LinkTo @route=\\"flight\\" @model={{event.flight.id}} class=\\"btn btn-default btn-sm pull-right\\">{{t \\"show\\"}}</LinkTo>
      "
  `);
});

test('handles link-to concat', () => {
  let input = `
    {{#link-to (concat someVariable ".detail") class="some-class"}}click{{/link-to}}
  `;

  expect(runTest('handles-link-to-concat.hbs', input)).toMatchInlineSnapshot(`
    "
        <LinkTo @route={{concat someVariable \\".detail\\"}} class=\\"some-class\\">click</LinkTo>
      "
  `);
});

test('handles link-to concat with hash', () => {
  let input = `
    {{#link-to (random-helper someVariable ".detail" do-the="thing") class="some-class"}}click{{/link-to}}
  `;

  expect(runTest('handles-link-to-concat.hbs', input)).toMatchInlineSnapshot(`
    "
        <LinkTo @route={{random-helper someVariable \\".detail\\" do-the=\\"thing\\"}} class=\\"some-class\\">click</LinkTo>
      "
  `);
});

test('component-else', () => {
  let input = `
    {{#foo bar="baz"}}
      42
    {{else}}
      123
    {{/foo}}
  `;

  expect(runTest('component-else.hbs', input)).toMatchInlineSnapshot(`
    "
        {{#foo bar=\\"baz\\"}}
          42
        {{else}}
          123
        {{/foo}}
      "
  `);
});

test('hyphens with nested usage', () => {
  let input = `
    {{shared/documents-modal/-email-client}}
    {{shared/-documents-modal/-email-client}}
    {{-shared/-documents-modal/-email-client}}
    {{-shared/documents-modal/-email-client}}
    {{-shared/documents-modal/email-client}}
    {{shared/-documents-modal/email-client}}
  `;

  expect(runTest('hyphens-everywhere.hbs', input)).toMatchInlineSnapshot(`
    "
        <Shared::DocumentsModal::-EmailClient />
        <Shared::-DocumentsModal::-EmailClient />
        <-Shared::-DocumentsModal::-EmailClient />
        <-Shared::DocumentsModal::-EmailClient />
        <-Shared::DocumentsModal::EmailClient />
        <Shared::-DocumentsModal::EmailClient />
      "
  `);
});

test('wallstreet', () => {
  let input = `
    {{#foo-bar$baz-bang/foo-bar/bang}}
      <div ...attributes>
        {{foo bar="baz"}}
      </div>
    {{/foo-bar$baz-bang/foo-bar/bang}}
    {{foo-bar$baz-bang/foo-bar/bang}}
  `;

  expect(runTest('wallstreet.hbs', input)).toMatchInlineSnapshot(`
    "
        <FooBar$BazBang::FooBar::Bang>
          <div ...attributes>
            <Foo @bar=\\"baz\\" />
          </div>
        </FooBar$BazBang::FooBar::Bang>
        <FooBar$BazBang::FooBar::Bang />
      "
  `);
});

test('wallstreet-telemetry', () => {
  let input = `
    {{nested$helper}}
    {{nested::helper}}
    {{nested$helper param="cool!"}}
    {{nested::helper param="yeah!"}}
    {{helper-1}}
  `;

  expect(runTest('wallstreet-telemetry.hbs', input)).toMatchInlineSnapshot(`
    "
        {{nested$helper}}
        {{nested::helper}}
        {{nested$helper param=\\"cool!\\"}}
        {{nested::helper param=\\"yeah!\\"}}
        {{helper-1}}
      "
  `);
});

test('attr-space', () => {
  let input = `
    <MyComp::Test @color={{"custom-2"}} @visible={{Group.item.isNew}} />
    <MyComp::Test @color="custom-2" @visible={{Group.item.isNew}} />
    <MyComp @value={{value}} @cont={{this}} @class={{model.some-stuff-here}} />
  `;

  expect(runTest('attr-space.hbs', input)).toMatchInlineSnapshot(`
      "
          <MyComp::Test @color={{\\"custom-2\\"}} @visible={{Group.item.isNew}} />
          <MyComp::Test @color=\\"custom-2\\" @visible={{Group.item.isNew}} />
          <MyComp @value={{value}} @cont={{this}} @class={{model.some-stuff-here}} />
        "
    `);
});

test('No telemetry', () => {
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

  expect(runTestWithData('no-telemetry.hbs', input, {}, {})).toMatchInlineSnapshot(`
    "
        <MyCard as |card|>
          <card.title @title=\\"My Card Title\\" />
          <card.content>
            <p>hello</p>
          </card.content>
          <card.foo-bar />
          {{card.foo}}
        </MyCard>
      "
  `);
});
