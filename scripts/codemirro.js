
var fs = require('fs');
var path = require('path');

var modeDir = path.join(__dirname, "../src/assert/codemirror/mode");

var gs = fs.readdirSync(modeDir);
console.log(gs);
console.log(gs.map(g=>`{label:"${g}",mode:"${g}"}`).join(","))
//console.log(gs.map(g=> `{label:"${g}",load:await import('../../../src/assert/codemirror/mode/${g}/${g}.js')}`).join(",\n"));
