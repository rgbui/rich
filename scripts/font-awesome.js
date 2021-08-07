
var YAML = require('yamljs');
var path = require('path');

var filePath = path.join(__dirname, "../src/assert/font-awesome/metadata/categories.yml");

var icons = YAML.load(filePath);
var dj = require(path.join(__dirname, '../extensions/font-awesome/icons.json'));
var djFontKeys = Object.keys(dj.fonts);
var ps = [];
for (let n in icons) {
    var group = icons[n];
    var da = dj.categories.filter(g => g.name == group.label)[0]
    var ics = group.icons.map(icon => {
        var dk = djFontKeys.filter(g => g.startsWith('fab-' + icon) || g.startsWith('fa-' + icon) || g.startsWith('fas-' + icon) || g.startsWith('far-' + icon))[0]
        var df = dk ? dj.fonts[dk] : undefined;
        var e = {};
        if (df) {
            e.label = df.label;
            e.keywords = df.keyword;
        }
        else {
            console.warn('not found icon ' + icon);
            if (icon == 'vest') {
                e = {
                    label: '背心',
                    keywords: ['背心', '汗衫', 'vest', 'vest-patches']
                }
            }
            else if (icon == 'vest-patches') {
                e = {
                    label: '背心补丁',
                    keywords: ['背心补丁', '汗衫补丁','背心', '汗衫', 'vest', 'vest-patches']
                }
            }
        }
        return {
            name: icon,
            ...e
        }
    });
    ps.push({ name: group.label, text: da ? da.cnName : group.label, icons: ics });
}

var fs = require('fs');
fs.writeFileSync(path.join(__dirname, "../extensions/font-awesome/data.json"), JSON.stringify(ps, null, 2))