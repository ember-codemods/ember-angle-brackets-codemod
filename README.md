# ember-angle-brackets-codemod

[![Build Status](https://travis-ci.org/rajasegar/ember-angle-brackets-codemod.svg?branch=master)](https://travis-ci.org/rajasegar/ember-angle-brackets-codemod) 
[![Coverage Status](https://coveralls.io/repos/github/rajasegar/ember-angle-brackets-codemod/badge.svg?branch=master)](https://coveralls.io/github/rajasegar/ember-angle-brackets-codemod?branch=master)
[![npm version](http://img.shields.io/npm/v/ember-angle-brackets-codemod.svg?style=flat)](https://npmjs.org/package/ember-angle-brackets-codemod "View this project on npm")
[![dependencies Status](https://david-dm.org/rajasegar/ember-angle-brackets-codemod/status.svg)](https://david-dm.org/rajasegar/ember-angle-brackets-codemod)
[![devDependencies Status](https://david-dm.org/rajasegar/ember-angle-brackets-codemod/dev-status.svg)](https://david-dm.org/rajasegar/ember-angle-brackets-codemod?type=dev)

A [jscodeshift](https://github.com/facebook/jscodeshift) Codemod to convert curly braces syntax to angle brackets syntax for templates
in an Ember.js app

Refer to this [RFC](https://github.com/emberjs/rfcs/blob/master/text/0311-angle-bracket-invocation.md) for more details on Angle brackets invocation syntax.

## Usage 

**WARNING**: `jscodeshift`, and thus this codemod, **edits your files in place**.
It does not make a copy. Make sure your code is checked into a source control
repository like Git and that you have no outstanding changes to commit before
running this tool.

```sh
$ cd my-ember-app-or-addon
$ npx ember-angle-brackets-codemod angle-brackets app/templates
```

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
    .filter(name=>(name.includes('/helpers/')|| name.includes('/helper')))
    .filter(name=>!name.includes('/-')).map(name=>{
        let path = name.split('/helpers/');
        return path.pop();
    }).filter(name=>!name.includes('/')).uniq();

copy(JSON.stringify(componentLikeHelpers))
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
