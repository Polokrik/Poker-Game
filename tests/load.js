// Charge les scripts du navigateur (variables globales) dans un même contexte Node.
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function load(files) {
  const src = files.map(f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8')).join('\n;\n');
  return vm.runInThisContext(src + '\n;({' + (process.env.EXPORTS || '') + '})');
};
