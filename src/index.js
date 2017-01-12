(function () {

  var _ = require('underscore'),
    fs = require('fs'),
    glob = require('glob'),
    readline = require('readline'),
    nameRex = /\/\/\s*\@name\s*(.+)\s*/,
    requiresRex = /\/\/\s*\@requires\s*(.+)\s*/,
    blockNameRex = /\*\s*\@name\s*(.+)\s*/,
    blockRequiresRex = /\*\s*\@requires\s*(.+)\s*/,
    startBlockRex = /\/\*\*/,
    endBlockRex = /\*\//;

  module.exports = {
    parseFile: parseFile,
    sortFiles: sortFiles
  };

  function parseFile(fileName, cb) {

    var parser = new Parser(),
      lineReader = readline.createInterface({
        input: fs.createReadStream(fileName)
      });

    parser.map.fileName = fileName;

    lineReader.on('line', parser.readLine);

    lineReader.on('close', function () {
      cb(parser.map);
    });

  }

  function sortFiles(sources, cb) {

    var fileMaps = {},
      objectMap = {},
      mapList = [],
      globsDone = 0,
      ignore = [],
      errors = [],
      i = 0;

    while (true) {
      if (sources[i].indexOf('!') === 0) {
        ignore.push(sources[i].substring(1));
        sources.splice(i, 1);
      }
      else {
        i++;
      }
      if (i >= sources.length) {
        break;
      }
    }

    _.each(sources, function (src) {

      glob(src, { ignore: ignore }, function (err, files) {
        var filesDone = 0;

        _.each(files, function (file) {

          parseFile(file, function (map) {

            buildMap(map);
            filesDone++;

            if (filesDone === files.length) {
              globsDone++;

              if (globsDone === sources.length) {
                cb(sortMaps(), errors.length === 0 ? null : errors);
              }
            }

          });

        });

      });

    });

    function buildMap(map) {

      fileMaps[map.fileName] = map;
      mapList.push(map);

      _.each(map.names, function (name) {

        if (!objectMap[name]) {
          objectMap[name] = map;
        }
        else if (objectMap[name].fileName != map.fileName) {
          errors.push('Duplicate @name "' + name + '" found in both "' + objectMap[name].fileName + '" and "' + map.fileName + '".');
        }

      });

    }

    function sortMaps() {
      var sortedFiles = [];

      _.each(fileMaps, function (map) {

        buildNode(map);

      });

      sortedFiles = _.sortBy(mapList, function(map) {
        return map.tier;
      });

      return _.map(sortedFiles, function(map) {
        return map.fileName;
      });

    }

    function buildNode(map) {

      _.each(map.requires, function (require) {

        var parent = objectMap[require];

        if (!parent) {
          errors.push('Reference not found for @required "' + require + '" in "' + map.fileName + '".');
        }
        else {

          parent.children.push(map);
          map.parents.push(parent);
          if (map.tier <= parent.tier) {
            map.tier = parent.tier + 1;
          }

          checkNode(map, []);

        }

      });

    }

    function checkNode(map, children) {

      _.each(map.parents, function(parent) {

        var err;

        if (children.indexOf(parent.fileName) !== -1) {
          
          err = 'Cicrular reference found for file "' + parent.fileName + '".\nDependency stack: ' + JSON.stringify(children, null, 2);
          
          if (errors.indexOf(err) === -1) {
            errors.push(err);
          }

        }
        else {

        children.push(map.fileName);
        checkNode(parent, children);

        }

      });

    }

  }

  function Parser() {
    var inBlock,
      matches,
      map = {
        names: [],
        requires: [],
        parents: [],
        children: [],
        requiredFiles: [],
        tier: 0
      };

    this.readLine = readLine;

    this.map = map;

    function readLine(line) {
      matches = nameRex.exec(line);

      if (matches && matches.length > 1) {
        map.names.push(matches[1]);
      }
      else {
        matches = requiresRex.exec(line);

        if (matches && matches.length > 1) {
          map.requires.push(matches[1]);
        }
      }

      if (inBlock) {
        matches = blockNameRex.exec(line);

        if (matches && matches.length > 1) {
          map.names.push(matches[1]);
        }
        else {
          matches = blockRequiresRex.exec(line);

          if (matches && matches.length > 1) {
            map.requires.push(matches[1]);
          }
        }

        inBlock = !endBlockRex.test(line);
      }
      else {
        inBlock = startBlockRex.test(line);
      }
    }
  }
} ());