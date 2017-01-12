(function () {
  var _ = require('underscore'),
    jsdocRequire = require('../src/index'),
    sortTestOrder = [4, 5, 1, 2, 3],
    sortSource = _.map(sortTestOrder, function (num) { return 'test/js/good/test-code-' + num + '.js'; });

  describe('Sorting tests', function () {
    var sortedFiles,
      sortErrors,
      parseErrors;

    beforeAll(function (done) {
      var count = 0;
      jsdocRequire.sortFiles(sortSource, function (files, errors) {
        sortedFiles = files;
        if (++count == 3) {
          done();
        }
      });
      jsdocRequire.sortFiles(['test/js/parse/*.js'], function (files, errors) {
        parseErrors = errors;
        if (++count == 3) {
          done();
        }
      });
      jsdocRequire.sortFiles(['test/js/circular/*.js'], function (files, errors) {
        sortErrors = errors;
        if (++count == 3) {
          done();
        }
      });
    });

    it('finds missing references', function () {
      expect(parseErrors.length).toBe(5);
      expect(parseErrors).toEqual([
        'Reference not found for @required "requires1_in_block" in "test/js/parse/test-code.js".',
        'Reference not found for @required "requires2_in_block" in "test/js/parse/test-code.js".',
        'Reference not found for @required "requires3_in_block" in "test/js/parse/test-code.js".',
        'Reference not found for @required "requires4_in_block" in "test/js/parse/test-code.js".',
        'Reference not found for @required "inline_requires" in "test/js/parse/test-code.js".']);
    });
    it('finds circular references', function () {
      expect(sortErrors.length).toBeGreaterThan(0);
    });
    it('sorts files', function () {
      expect(sortedFiles.length).toBe(5);
      expect(sortedFiles.indexOf('test/js/good/test-code-1.js')).toBeLessThan(sortedFiles.indexOf('test/js/good/test-code-3.js'));
      expect(sortedFiles.indexOf('test/js/good/test-code-2.js')).toBeLessThan(sortedFiles.indexOf('test/js/good/test-code-4.js'));
      expect(sortedFiles.indexOf('test/js/good/test-code-3.js')).toBeLessThan(sortedFiles.indexOf('test/js/good/test-code-4.js'));
      expect(sortedFiles.indexOf('test/js/good/test-code-1.js')).toBeLessThan(sortedFiles.indexOf('test/js/good/test-code-5.js'));
      expect(sortedFiles.indexOf('test/js/good/test-code-4.js')).toBeLessThan(sortedFiles.indexOf('test/js/good/test-code-5.js'));
    });

  });

} ());