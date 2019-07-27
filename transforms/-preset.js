'use strict';

const path = require('path');
const fs = require('fs');
const { getOptions } = require('codemod-cli');

module.exports = function(type) {
  let transformPath = path.join(__dirname, type, 'transforms');

  return function(file, api) {
    let src = file.source;
    let options = getOptions();
    let error;

    fs.readdirSync(transformPath).forEach(fileName => {
      let fix = require(path.join(transformPath, fileName));
      if (typeof src === 'undefined') {
        return;
      }
      try {
        src = fix(Object.assign({}, file, { source: src }), api, options);
      } catch (e) {
        error = new Error(
          `Transformation ${fileName} errored on file ${file.path}. Reason ${e}. Please report this in https://github.com/ember-codemods/ember-angle-brackets-codemod/issues\n\nStack trace:\n${e.stack}\n\nSource:\n${src}`
        );
      }
    });

    if (error) {
      throw error;
    }
    return src;
  };
};
