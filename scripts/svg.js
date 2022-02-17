var path = require('path');
var fs = require('fs');
var svgDir = path.join(__dirname, "../src/assert/svg")
var files = fs.readdirSync(svgDir);
files = files.map(f => {
    var name = f.replace('.svg', '')
        .replace(/\.([a-z])/g, ($, $1) => { return $1.toUpperCase() })
        .replace(/\./, "")
        .replace(/^([a-z])/g, ($, $1) => { return $1.toUpperCase() }) + 'Svg';
    return { name, file: f }
});
console.log(files);





var str = `${files.map(f => {
    return `import ${f.name} from "../src/assert/svg/${f.file}";`
}).join("\n")}

export  {
${files.map(f => f.name).join(",\n")}
}`

fs.writeFileSync(path.join(__dirname, "../component/svgs.ts"), str)


