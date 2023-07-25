

// import { IconCompiler, IIconToolsOptions } from '@icon-park/compiler';
var fs = require('fs');
var path = require('path');
const IconCompiler = require('@icon-park/compiler').IconCompiler
var icons = require('./byte-dance.icons.json')

const BUILD_CONFIG = {
    author: 'IconPark',
    useType: false,
    fixedSize: false,
    stroke: 3,
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    cssPrefix: 'i',
    colors: [
        {
            type: 'color',
            color: '#000'
        },
        {
            type: 'color',
            color: '#2F88FF'
        },
        {
            type: 'color',
            color: '#FFF'
        },
        {
            type: 'color',
            color: '#43CCF8'
        }
    ],
    theme: [
        {
            name: 'outline',
            fill: [
                {
                    type: 'color',
                    color: '#333',
                    name: 'fill',
                    currentColor: true
                },
                {
                    type: 'color',
                    color: 'transparent',
                    fixed: true,
                    name: 'background'
                }
            ],
            order: [0, 1, 0, 1]
        },
        {
            name: 'filled',
            fill: [
                {
                    type: 'color',
                    color: '#333',
                    name: 'fill',
                    currentColor: true
                },
                {
                    type: 'color',
                    color: '#FFF',
                    fixed: true,
                    name: 'background'
                }
            ],
            order: [0, 0, 1, 1]
        },
        {
            name: 'two-tone',
            fill: [
                {
                    type: 'color',
                    color: '#333',
                    name: 'fill',
                    currentColor: true
                },
                {
                    type: 'color',
                    color: '#2F88FF',
                    name: 'twoTone'
                }
            ],
            order: [0, 1, 0, 1]
        },
        {
            name: 'multi-color',
            fill: [
                {
                    type: 'color',
                    color: '#333',
                    name: 'outStrokeColor',
                    currentColor: true
                },
                {
                    type: 'color',
                    color: '#2F88FF',
                    name: 'outFillColor'
                },
                {
                    type: 'color',
                    color: '#FFF',
                    name: 'innerStrokeColor'
                },
                {
                    type: 'color',
                    color: '#43CCF8',
                    name: 'innerFillColor'
                }
            ],
            order: [0, 1, 2, 3]
        }
    ]
};

const compiler = IconCompiler.instance({
    ...BUILD_CONFIG,
    type: 'svg'
});

// var icons = [
//     {
//         "id": 0,
//         "title": "拐杖",
//         "name": "a-cane",
//         "category": "Clothes",
//         "categoryCN": "服饰",
//         "author": "马玉欣",
//         "tag": [
//             "工具",
//             "登山杖",
//             "拐杖",
//             "木棍"
//         ],
//         "rtl": true,
//         "svg": "<svg width=\"48\" height=\"48\" viewBox=\"0 0 48 48\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M19.5576 44.7684C19.5576 44.7684 32.468 20.4873 33.6417 18.28C34.8154 16.0726 37.4535 8.98102 30.3899 5.22524C23.3263 1.46947 19.1571 7.18063 17.7486 9.82948\" stroke=\"black\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n</svg>"
//     }
// ]

icons.forEach(item => compiler.appendIcon({
    name: item.name,
    description: item.title,
    content: item.svg,
    rtl: item.rtl
}));


var ps = ['var icons = new Map<string,(props:{id:string,width:number,height:number,colors:string[],strokeWidth:number,strokeLinecap:string,strokeLinejoin:string})=>string>();'];
icons.forEach(item => {
    var iff = compiler.getIconFile(item.name)
    if (!iff) {
        console.log(item);
    }
    if (iff) {
        var jsCode = iff.content;
        delete item.svg;
        var str = '(props)'
        var at = jsCode.indexOf(str);
        jsCode = jsCode.slice(at, jsCode.lastIndexOf(')'));
        ps.push(`icons.set('${item.name}', ${jsCode});`);
    }
})
ps.push('export default icons');

fs.writeFileSync(path.join(__dirname, "byte-dance.icons.ts"), ps.join('\n'), 'utf8');

fs.writeFileSync(path.join(__dirname, "byte-dance-icons.json"), JSON.stringify(icons, undefined, 4), 'utf8');
// console.log(jsCode);
// var jx = eval(jsCode);
// console.log(jx({
//     width: 48,
//     height: 48,
//     fill: 'none',
//     strokeWidth: 3,
//     strokeLinejoin: 'round',
//     strokeLinecap: 'round',
//     colors: ['currentColor']
// }))
// const files = compiler.getIconFiles();
// console.log(files);
// console.log(compiler.getRuntimeCode());
// console.log(compiler.getLessCode());