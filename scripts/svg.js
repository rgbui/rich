var path = require('path');
var fs = require('fs');


function makeRichSvg() {
    var svgDir = path.join(__dirname, "../src/assert/svg")
    var files = fs.readdirSync(svgDir);
    files = files.map(f => {
        var name = f.replace('.svg', '')
            .replace(/\.([a-z])/g, ($, $1) => { return $1.toUpperCase() })
            .replace(/\./, "")
            .replace(/^([a-z])/g, ($, $1) => { return $1.toUpperCase() }) + 'Svg';
        return { name, file: f }
    });

    var str = `${files.map(f => {
        return `import ${f.name} from "../src/assert/svg/${f.file}";`
    }).join("\n")}

export  {
${files.map(f => f.name).join(",\n")}
}`

    fs.writeFileSync(path.join(__dirname, "../component/svgs.ts"), str)
}
makeRichSvg();
function makeShySvg() {
    var svgDir = path.join(__dirname, "../../shy/src/assert/svg")
    var files = fs.readdirSync(svgDir);
    files = files.map(f => {
        var name = f.replace('.svg', '')
            .replace(/\.([a-z])/g, ($, $1) => { return $1.toUpperCase() })
            .replace(/\./, "")
            .replace(/^([a-z])/g, ($, $1) => { return $1.toUpperCase() }) + 'Svg';
        return { name, file: f }
    });

    var str = `${files.map(f => {
        return `import ${f.name} from "../assert/svg/${f.file}";`
    }).join("\n")}

export  {
${files.map(f => f.name).join(",\n")}
}`

    fs.writeFileSync(path.join(__dirname, "../../shy/src/component/svgs.ts"), str)
}
makeShySvg()




