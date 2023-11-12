
import * as  Mammoth from "mammoth/mammoth.browser.js";


import { parseHtml } from "../html/parse";


async function getWordHtml(file: File) {
    return new Promise((resolve: (html: string) => void, reject) => {
        var reader = new FileReader();
        reader.onloadend = function (event) {
            let arrayBuffer = reader.result;
            //将word 转换成html
            Mammoth.convertToHtml({ arrayBuffer: arrayBuffer }).then(function (
                resultObject
            ) {
                resolve(resultObject);
            });
        };
        reader.readAsArrayBuffer(file);
    })
}

export async function parseWord(file: File) {
    // https://github.com/mwilliamson/mammoth.js/
    var html = await getWordHtml(file);
    var blocks = await parseHtml(html);
    return blocks;
}