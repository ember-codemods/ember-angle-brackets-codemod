'use strict';

const { getOptions } = require('codemod-cli');

module.exports = function(file, api) {
  let src = file.source;
  let options = getOptions();

  let fix = require('./angle-brackets-syntax');
  if (typeof src === 'undefined') {
    return;
  }
  try {
    src = fix(file, api, options);
  } catch (e) {
    throw new Error(
      `Transformation errored on file ${file.path}. Reason ${e}. Please report this in https://github.com/ember-codemods/ember-angle-brackets-codemod/issues\n\nStack trace:\n${e.stack}\n\nSource:\n${src}`
    );
  }

  return src;
};
