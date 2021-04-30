# ember-angle-brackets-codemod

[![Ember Observer Score](https://emberobserver.com/badges/ember-angle-brackets-codemod.svg)](https://emberobserver.com/addons/ember-angle-brackets-codemod)
[![Build Status](https://travis-ci.org/ember-codemods/ember-angle-brackets-codemod.svg?branch=master)](https://travis-ci.org/ember-codemods/ember-angle-brackets-codemod)
[![Coverage Status](https://coveralls.io/repos/github/ember-codemods/ember-angle-brackets-codemod/badge.svg?branch=master)](https://coveralls.io/github/ember-codemods/ember-angle-brackets-codemod?branch=master)
[![npm version](http://img.shields.io/npm/v/ember-angle-brackets-codemod.svg?style=flat)](https://npmjs.org/package/ember-angle-brackets-codemod 'View this project on npm')
[![dependencies Status](https://david-dm.org/ember-codemods/ember-angle-brackets-codemod/status.svg)](https://david-dm.org/ember-codemods/ember-angle-brackets-codemod)
[![devDependencies Status](https://david-dm.org/ember-codemods/ember-angle-brackets-codemod/dev-status.svg)](https://david-dm.org/ember-codemods/ember-angle-brackets-codemod?type=dev)

A [jscodeshift](https://github.com/facebook/jscodeshift) Codemod to convert curly braces syntax to angle brackets syntax for templates
in an Ember.js app

Refer to this [RFC](https://github.com/emberjs/rfcs/blob/master/text/0311-angle-bracket-invocation.md) for more details on Angle brackets invocation syntax.

## Requirements

This codemod currently only supports Ember's classic filesystem layout, meaning it won't work if your app uses pods. For more info, [see this issue](https://github.com/ember-codemods/ember-angle-brackets-codemod/issues/217).

## Usage

**WARNING**: `jscodeshift`, and thus this codemod, **edits your files in place**.
It does not make a copy. Make sure your code is checked into a source control
repository like Git and that you have no outstanding changes to commit before
running this tool.

1. Start your ember development server
2. Run Codemod, pointing it at the address of the development server

```sh
$ cd my-ember-app-or-addon
$ npx ember-angle-brackets-codemod --telemetry=http://localhost:4200 ./path/of/files/ or ./some**/*glob.hbs
```

Telemetry helpers runs the app, grabs basic info about all of the modules at runtime. This allows the codemod to know the names of every helper, component, route, controller, etc. in the app without guessing / relying on static analysis. They basically help you to create "runtime assisted codemods".

See "Gathering runtime data" section of [ember-native-class-codemod](https://github.com/ember-codemods/ember-native-class-codemod#gathering-runtime-data) for some additonal information.

### Running the codemod without Telemetry

```sh
$ cd my-ember-app-or-addon
$ npx ember-angle-brackets-codemod ./path/of/files/ or ./some**/*glob.hbs
```

**NOTE** If you are not using telemetry, you will probably need to [manually configure the codemod to at least skip any helpers](#skipping-helpers) that are invoked in the template files you are running it on.

## From

```hbs
{{site-header user=this.user class=(if this.user.isAdmin "admin")}}

{{#super-select selected=this.user.country as |s|}}
  {{#each this.availableCountries as |country|}}
    {{#s.option value=country}}{{country.name}}{{/s.option}}
  {{/each}}
{{/super-select}}

{{ui/button text="Click me"}}
```

## To

```hbs
<SiteHeader @user={{this.user}} class={{if this.user.isAdmin "admin"}} />
<SuperSelect @selected={{this.user.country}} as |s|>
  {{#each this.availableCountries as |country|}}
    <s.option @value={{country}}>
      {{country.name}}
    </s.option>
  {{/each}}
</SuperSelect>

<Ui::Button @text="Click me" />
```

## Advanced Usage

### Skipping helpers

To help the codemod disambiguate components and helpers, you can define a list of helpers from your application in a configuration file as follows:

**config/anglebrackets-codemod-config.json**

```js
{
  "helpers": [
    "date-formatter",
    "info-pill"
  ]
}
```

The codemod will then ignore the above list of helpers and prevent them from being transformed into the new angle-brackets syntax.

You can also disable the conversion of the built-in components `{{link-to}}`, `{{input}}` and `{{textarea}}` as follows:

**config/anglebrackets-codemod-config.json**

```js
{
  "helpers": [],
  "skipBuiltInComponents": true
}
```

You can execute the codemod with custom configuration by specifying a `--config` command line option as follows:

```sh
$ cd my-ember-app-or-addon
$ npx ember-angle-brackets-codemod angle-brackets app/templates --config ./config/anglebrackets-codemod-config.json
```

To get a list of helpers in your app you can do this in the Developer Console in your browser inside of your app:

```js
var componentLikeHelpers = Object.keys(require.entries)
  .filter(name => name.includes('/helpers/') || name.includes('/helper'))
  .filter(name => !name.includes('/-'))
  .map(name => {
    let path = name.split('/helpers/');
    return path.pop();
  })
  .filter(name => !name.includes('/'))
  .uniq();

copy(JSON.stringify(componentLikeHelpers));
```

### Skipping some files

If there are files that don't convert well, you can skip them by specifying an optional `skipFilesThatMatchRegex` configuration setting. For example, with the configuration below, all files that contain `"foo"` or `"bar"` will be skipped:

**config/anglebrackets-codemod-config.json**

```js
{
  "helpers": [],
  "skipBuiltInComponents": true,
  "skipFilesThatMatchRegex": "foo|bar"
}
```

### Skipping some attributes

If there are cases where some attributes should not be prefixed with `@`, you can skip them by specifying an optional `skipAttributesThatMatchRegex` configuration setting.
For example, with the configuration below, all attributes that matches either `/data-/gim` or `/aria-/gim` will not be prefixed with `@`:

### Processing valueless data test attributes

Curly invocations that have `data-test-` attributes with no value are not processed by default. The configuration below will cause them to be processed:

**config/anglebrackets-codemod-config.json**

```js
{
  "includeValuelessDataTestAttributes": true
}
```

**config/anglebrackets-codemod-config.json**

```js
{
  "helpers": [],
  "skipBuiltInComponents": true,
  "skipAttributesThatMatchRegex": ["/data-/gim", "/aria-/gim"]
}
```

Input:

```js
  {{some-component data-test-foo=true aria-label="bar" foo=true}}
```

Output:

```js
  <SomeComponent data-test-foo={{true}} aria-label="bar" @foo={{true}} />
```

### Converting specific components only

If you would like to only convert certain component invocations to use the angle brackets syntax, use the `components` configuration setting and specify component names. For example, with the configuration below, only the `{{baz}}` and `{{bat}}` components will be converted, leaving everything else intact.

**config/anglebrackets-codemod-config.json**

```js
{
  "components": ["baz", "bat"]
}
```

## Debugging Workflow

Oftentimes, you want to debug the codemod or the transform to identify issues with the code or to understand
how the transforms are working, or to troubleshoot why some tests are failing.

Hence we recommend a debugging work-flow like below to quickly find out what is causing the issue.

### 1. Place `debugger` statements

Add `debugger` statements, in appropriate places in the code. For example:

```js
...
const params = a.value.params.map(p => {
  debugger;
  if(p.type === "SubExpression") {
    return transformNestedSubExpression(p)
...
```

### 2. Inspect the process with node debug

Here we are going to start the tests selectively in node debug mode. Since the
codemod is using [jest](https://jestjs.io/) in turn
to run the tests, jest is having an option `-t <name-of-spec>` to run a particular
set of tests instead of running the whole test suite.

We are making use of both these features to start our tests in this particular fashion.
For more details on node debug, visit the [official](https://nodejs.org/en/docs/guides/debugging-getting-started/)
Node.js debugging guide, and for jest documentation on tests, please refer [here](https://jestjs.io/docs/en/cli).

```sh
node --inspect-brk ./node_modules/.bin/jest --runInBand --testNamePattern <test-name> 
```

For example, if you want to debug the `null-subexp` test or only that particular test case is failing because of an issue.

```sh
node --inspect-brk ./node_modules/.bin/jest --runInBand --testNamePattern 'null-subexp' 
```

Or you can make use of the npm scripts defined in package.json. All you need to pass the test name as the extra parameter with the script.

```sh
npm run debug:test 'null-subexp'
```

Using yarn
```sh
yarn debug:test 'null-subexp'
```

Once you run the above command, your tests will start running in debug mode and your breakpoints will be
triggered appropriately when that particular block of code gets executed. You can run the debugger inside
Chrome browser dev-tools. More details on [here](https://developers.google.com/web/tools/chrome-devtools/javascript/)

## AST Explorer playground

1. Go to the [AST Explorer](https://astexplorer.net/#/gist/b128d5545d7ccc52400b922f3b5010b4/642c6a8d3cc021257110bcf6b1714d1065891aec)
2. Paste your curly brace syntax code in the top left corner window (Source)
3. You will get the converted angle bracket syntax in the bottom right corner window (Transform Output)

## RFC

- [Angle Bracket Invocation](https://github.com/emberjs/rfcs/blob/master/text/0311-angle-bracket-invocation.md)
- [Angle Bracket Invocations For Built-in Components](https://github.com/emberjs/rfcs/blob/32a25b31d67d67bc7581dd0bead559063b06f076/text/0459-angle-bracket-built-in-components.md)

## Known issues

- No formatting preserved

## References:

- https://github.com/glimmerjs/glimmer-vm/issues/685
- https://github.com/q2ebanking/ember-template-rewrite
- https://github.com/ember-template-lint/ember-template-recast
