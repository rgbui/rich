var path = require('path');
var fs = require('fs');


function makeRichSvg() {
    var svgDir = path.join(__dirname, "../src/assert/svg")
    var files = fs.readdirSync(svgDir);
    files = files.map(f => {
        if (!f.endsWith('.svg')) return;
        var name = f.replace('.svg', '')
            .replace(/\.([a-z])/g, ($, $1) => { return $1.toUpperCase() })
            .replace(/\./, "")
            .replace(/^([a-z])/g, ($, $1) => { return $1.toUpperCase() }) + 'Svg';
        return { name, file: f }
    });
    for (let i = files.length - 1; i >= 0; i--) {
        if (!files[i]) {
            files.splice(i, 1)
        }
    }
    var str = `${files.map(f => {
        if (!f) return;
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
        if (!f.endsWith('.svg')) return;
        var name = f.replace('.svg', '')
            .replace(/\.([a-z])/g, ($, $1) => { return $1.toUpperCase() })
            .replace(/\./, "")
            .replace(/^([a-z])/g, ($, $1) => { return $1.toUpperCase() }) + 'Svg';
        return { name, file: f }
    });
    for (let i = files.length - 1; i >= 0; i--) {
        if (!files[i]) {
            files.splice(i, 1)
        }
    }

    var str = `${files.map(f => {
        if (!f) return;
        return `import ${f.name} from "../assert/svg/${f.file}";`
    }).join("\n")}

export  {
${files.map(f => f.name).join(",\n")}
}`

    fs.writeFileSync(path.join(__dirname, "../../shy/src/component/svgs.ts"), str)
}
makeShySvg()




