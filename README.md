# jsdoc-require
Use jsdoc @name and @require tags to establish JavaScript file dependencies.

## Usage:

    var jsdocRequire = require('jsdoc-require');

    jsdocRequire.sortFiles(['src/**/*.js'], function(sorted) {
      // do something with sorted files like concatenate
    });


Note: This module is intended only to establish the order of JavaScript
files based on @name and @require tags in comments. Dependencies are only
based on files and not individual object names so this is not intended to be 
used to determine object dependencies.
