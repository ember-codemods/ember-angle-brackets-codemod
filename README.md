# ember-angle-brackets-codemod
A jscodeshift Codemod to convert curly braces syntax to angle brackets syntax

Refer to this [RFC](https://github.com/emberjs/rfcs/blob/master/text/0311-angle-bracket-invocation.md) for more details on Angle brackets invocation syntax.

## Usage

### 1. Install jscodeshift
Get jscodeshift from npm:

```sh
$ npm install -g jscodeshift
```
This will install the runner as jscodeshift.

### 2. Run the transform
```sh
jscodeshift -t https://raw.githubusercontent.com/rajasegar/ember-angle-brackets-codemods/master/transform.js app/templates
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
