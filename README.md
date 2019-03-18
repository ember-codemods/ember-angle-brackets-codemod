# ember-angle-brackets-codemod [BETA]
A jscodeshift Codemod to convert curly braces syntax to angle brackets syntax

Refer to this [RFC](https://github.com/emberjs/rfcs/blob/master/text/0311-angle-bracket-invocation.md) for more details on Angle brackets invocation syntax.

## Usage 1 

### 1. Install jscodeshift
Get jscodeshift from npm:

```sh
$ npm install -g jscodeshift
```
This will install the runner as jscodeshift.

### 2. Run the transform

```sh
jscodeshift -t https://raw.githubusercontent.com/rajasegar/ember-angle-brackets-codemods/master/transforms/transform.js --extensions=hbs app/templates
```


## Usage 2 (Working)

1. Go to the [AST Explorer](https://astexplorer.net/#/gist/b128d5545d7ccc52400b922f3b5010b4/571266d8c29cb8eb1bd5730c0c388526081cce46)
2. Paste your curly brace syntax code in the top left corner window (Source)
3. You will get the converted angle bracket syntax in the bottom right corner window (Transform Output)

## Usage 3 (Working partially)
In this approach we will be using the `ember-template-recast` tool  to transform.
[ember-template-recast](https://github.com/ember-template-lint/ember-template-recast) is a Non-destructive template transformer.

Install ember-template-recast globally.
```sh
$ npm install -g ember-template-recast
```

Run the transform
```sh
$ ember-template-recast -t https://raw.githubusercontent.com/rajasegar/ember-angle-brackets-codemods/master/transforms/etr-transform.js app/templates
```

One problem with this approach is that the inner blockStatements are not being transformed.

```hbs
<SiteHeader @user={{this.user}} class={{if this.user.isAdmin admin}}></SiteHeader>

<SuperSelect @selected={{this.user.country}} as |s|>
  {{#each this.availableCountries as |country|}}
    {{#s.option value=country}}{{country.name}}{{/s.option}}
  {{/each}}
</SuperSelect>
```



## From
```hbs
{{site-header user=this.user class=(if this.user.isAdmin "admin")}}

{{#super-select selected=this.user.country as |s|}}
  {{#each this.availableCountries as |country|}}
    {{#s.option value=country}}{{country.name}}{{/s.option}}
  {{/each}}
{{/super-select}}
```

## To
```hbs
<SiteHeader @user={{this.user}} class={{if this.user.isAdmin admin}}></SiteHeader>

<SuperSelect @selected={{this.user.country}} as |s|>{{#each this.availableCountries as |country|}}    <S.option value={{country}}>{{country.name}}</S.option>
{{/each}}</SuperSelect>
```

## AST Explorer playground
[AST Explorer](https://astexplorer.net/#/gist/b128d5545d7ccc52400b922f3b5010b4/571266d8c29cb8eb1bd5730c0c388526081cce46)

## Known issues
- No formatting preserved
- Block params need to be tweaked

## Things to do
- Need to add more html attributes
- Need to add more ignore blocks like if, unless, etc.,
