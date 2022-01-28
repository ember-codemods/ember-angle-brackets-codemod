Version 9 of Highlight.js has reached EOL and is no longer supported.
Please upgrade or ask whatever dependency you are using to upgrade.
https://github.com/highlightjs/highlight.js/issues/2877

## v5.1.0 (2022-01-28)

#### :rocket: Enhancement
* [#437](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/437) [Feature]: Add ability to convert only specific component invocations with each run ([@kcarmonamurphy](https://github.com/kcarmonamurphy))

#### :bug: Bug Fix
* [#486](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/486) fix any number of models in link-to ([@tylerturdenpants](https://github.com/tylerturdenpants))

#### :house: Internal
* [#486](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/486) fix any number of models in link-to ([@tylerturdenpants](https://github.com/tylerturdenpants))
* [#452](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/452) Update dependencies ([@tylerturdenpants](https://github.com/tylerturdenpants))
* [#393](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/393) fix eslint prettier errors ([@tylerturdenpants](https://github.com/tylerturdenpants))

#### Committers: 4
- Buck Doyle ([@backspace](https://github.com/backspace))
- Kevin Carmona-Murphy ([@kcarmonamurphy](https://github.com/kcarmonamurphy))
- Ryan Mark ([@tylerturdenpants](https://github.com/tylerturdenpants))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v5.0.0 (2020-05-06)

#### :boom: Breaking Change
* [#287](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/287) Add `--telemetry` argument and ensure running without telemetry is possible ([@rajasegar](https://github.com/rajasegar))

#### :house: Internal
* [#320](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/320) Update release automation settings. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 4
- Rajasegar Chandran ([@rajasegar](https://github.com/rajasegar))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Tom Wayson ([@tomwayson](https://github.com/tomwayson))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


* Add config to enable transform on valueless attrs (#241) (7e06914)
* Bump execa from 3.4.0 to 4.0.0 (#211) (0b06732)
* Bump jest from 24.9.0 to 25.1.0 (#235) (d8fa744)

## v4.0.0 (2020-02-03)

#### :house: Internal
* [#238](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/238) Drop node 8 support ([@tylerturdenpants](https://github.com/tylerturdenpants))

#### Committers: 3
- Rajasegar Chandran ([@rajasegar](https://github.com/rajasegar))
- Ryan Mark ([@tylerturdenpants](https://github.com/tylerturdenpants))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v3.1.2 (2020-01-13)

#### :bug: Bug Fix
* [#234](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/234) Add skipAttributesThatMatchRegex to config ([@suchitadoshi1987](https://github.com/suchitadoshi1987))

#### Committers: 1
- Suchita Doshi ([@suchitadoshi1987](https://github.com/suchitadoshi1987))

## v3.1.1 (2020-01-10)

#### :bug: Bug Fix
* [#229](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/229) Accept `skipAttributesThatMatchRegex ` option values as an array of regex strings ([@suchitadoshi1987](https://github.com/suchitadoshi1987))

#### Committers: 1
- Suchita Doshi ([@suchitadoshi1987](https://github.com/suchitadoshi1987))

## v3.1.0 (2020-01-08)

#### :rocket: Enhancement
* [#226](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/226) Add support to skip prefixing `@` for user provided attributes ([@suchitadoshi1987](https://github.com/suchitadoshi1987))

#### :bug: Bug Fix
* [#214](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/214) Fix false negatives for `link-to` with `data-` prefixed route name ([@tylerturdenpants](https://github.com/tylerturdenpants))

#### Committers: 4
- Ryan Mark ([@tylerturdenpants](https://github.com/tylerturdenpants))
- Sam Selikoff ([@samselikoff](https://github.com/samselikoff))
- Suchita Doshi ([@suchitadoshi1987](https://github.com/suchitadoshi1987))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v3.0.1 (2019-12-12)

#### :bug: Bug Fix
* [#205](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/205) fix wallstreet integration with telemetry data ([@hmajoros](https://github.com/hmajoros))
* [#203](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/203) Update README.md ([@samselikoff](https://github.com/samselikoff))

#### :memo: Documentation
* [#203](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/203) Update README.md ([@samselikoff](https://github.com/samselikoff))

#### Committers: 3
- Hank Majoros ([@hmajoros](https://github.com/hmajoros))
- Sam Selikoff ([@samselikoff](https://github.com/samselikoff))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v3.0.0 (2019-11-20)

#### :boom: Breaking Change
* [#154](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/154) Use telemetry data to detect known components and helpers ([@tylerturdenpants](https://github.com/tylerturdenpants))

#### :rocket: Enhancement
* [#154](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/154) Use telemetry data to detect known components and helpers ([@tylerturdenpants](https://github.com/tylerturdenpants))

#### Committers: 2
- Ryan Mark ([@tylerturdenpants](https://github.com/tylerturdenpants))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v2.1.0 (2019-11-12)

#### :rocket: Enhancement
* [#181](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/181) Add support for templates containing `~` (whitespace control) ([@Turbo87](https://github.com/Turbo87))
* [#155](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/155) Add a Logger ([@tylerturdenpants](https://github.com/tylerturdenpants))

#### :bug: Bug Fix
* [#182](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/182) fix hyphen usage ([@tylerturdenpants](https://github.com/tylerturdenpants))

#### :house: Internal
* [#175](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/175) Refactor nested functions to the outer scope ([@tylerturdenpants](https://github.com/tylerturdenpants))

#### Committers: 4
- Ryan Mark ([@tylerturdenpants](https://github.com/tylerturdenpants))
- Suchita Doshi ([@suchitadoshi1987](https://github.com/suchitadoshi1987))
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v2.0.0 (2019-10-22)

#### :boom: Breaking Change
* [#97](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/97) Use `ember-template-recast` to preserve existing template formatting as much as possible ([@tylerturdenpants](https://github.com/tylerturdenpants))
* [#100](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/100) Make node version explicit (Node 8 & >= 10) ([@kellyselden](https://github.com/kellyselden))

#### :rocket: Enhancement
* [#152](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/152) Preserve existing arguments (don't convert from named arguments to attributes during codemod) ([@tylerturdenpants](https://github.com/tylerturdenpants))
* [#145](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/145) Add more known common helpers ([@Turbo87](https://github.com/Turbo87))
* [#97](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/97) Use `ember-template-recast` to preserve existing template formatting as much as possible ([@tylerturdenpants](https://github.com/tylerturdenpants))
* [#137](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/137) Update list of common helpers ([@Turbo87](https://github.com/Turbo87))

#### :bug: Bug Fix
* [#172](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/172) Update to `ember-template-recast@3.2.6` to fix issues with loosing nested else-if contents ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#168](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/168) Skip block component conversion if the component has an `inverse` block ([@Turbo87](https://github.com/Turbo87))
* [#165](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/165) Fix `link-to` with `SubExpression` computing the target route name ([@makepanic](https://github.com/makepanic))
* [#158](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/158) Ensure using `link-to` with conditional models works properly ([@tylerturdenpants](https://github.com/tylerturdenpants))
* [#144](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/144) Fix inline link-to with subexpression caption crash ([@Turbo87](https://github.com/Turbo87))
* [#140](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/140) bin/cli: Set correct file extension ([@Turbo87](https://github.com/Turbo87))
* [#131](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/131) package.json: Remove broken `main` field ([@Turbo87](https://github.com/Turbo87))

#### :house: Internal
* [#163](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/163) Add test case for nested else if ([@Turbo87](https://github.com/Turbo87))
* [#149](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/149) Add test case for splattributes ([@Turbo87](https://github.com/Turbo87))
* [#47](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/47) Add whitespace control test ([@GavinJoyce](https://github.com/GavinJoyce))
* [#143](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/143) Use yarn instead of npm internally ([@tylerturdenpants](https://github.com/tylerturdenpants))
* [#142](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/142) tests: Use inline snapshots ([@Turbo87](https://github.com/Turbo87))
* [#141](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/141) Adjust `tilde` test fixture ([@Turbo87](https://github.com/Turbo87))
* [#138](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/138) Convert test suite to use Jest snapshot tests instead of fixture files ([@Turbo87](https://github.com/Turbo87))
* [#139](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/139) CI: Run ESLint ([@Turbo87](https://github.com/Turbo87))
* [#135](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/135) ESLint: Fix test path pattern ([@Turbo87](https://github.com/Turbo87))
* [#134](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/134) Remove obsolete ASTExplorer files ([@Turbo87](https://github.com/Turbo87))
* [#136](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/136) Cleanup file structure ([@Turbo87](https://github.com/Turbo87))
* [#133](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/133) Update dependencies ([@Turbo87](https://github.com/Turbo87))
* [#132](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/132) Replace `ember-addon` keyword with `ember-codemod` ([@Turbo87](https://github.com/Turbo87))
* [#130](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/130) package.json: Sort contents according to documentation ([@Turbo87](https://github.com/Turbo87))
* [#128](https://github.com/ember-codemods/ember-angle-brackets-codemod/pull/128) Remove `husky` and `lint-staged` dev dependencies ([@Turbo87](https://github.com/Turbo87))

#### Committers: 8
- Christian ([@makepanic](https://github.com/makepanic))
- Gavin Joyce ([@GavinJoyce](https://github.com/GavinJoyce))
- Kelly Selden ([@kellyselden](https://github.com/kellyselden))
- Rajasegar Chandran ([@rajasegar](https://github.com/rajasegar))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Ryan Mark ([@tylerturdenpants](https://github.com/tylerturdenpants))
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

