(function () {
  var jsdocRequire = require('../src/index');

  describe('Parser tests', function () {
    var reqMap;

    beforeEach(function (done) {
      jsdocRequire.parseFile('test/js/parse/test-code.js', function (map) {
        reqMap = map;
        done();
      });
    });

    it('parses file', function () {
      expect(reqMap.names.length).toBe(2);
      expect(reqMap.requires.length).toBe(5);
      expect(reqMap.names).toEqual(['name_in_block', 'inline_name']);
      expect(reqMap.requires).toEqual(['requires1_in_block', 'requires2_in_block', 'requires3_in_block', 'requires4_in_block', 'inline_requires']);
    });

  });

} ());