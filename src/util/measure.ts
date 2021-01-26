
// import { util } from "./util";
// let __g: CanvasRenderingContext2D;
// export type TextRowSpan = {
//     text: string,
//     start: number,
//     end: number,
//     width: number,
//     height: number,
//     newline?: boolean
// }
// export class MeaureWord {
//     /**
//      * 文字区域的样式
//      */
//     fontStyle: TextFontStyle;
//     /**
//      * 文字区域的宽度
//      */
//     width: number;
//     text: string;
//     constructor(fontStyle: TextFontStyle, width: number) {
//         this.fontStyle = fontStyle;
//         this.width = width;
//     }
//     /**
//      * 获取文字和宽度
//      */
//     get letterSpacing() {
//         var ls = 0;
//         if (typeof this.fontStyle.letterSpacing == 'undefined') ls = 0;
//         else if (typeof this.fontStyle.letterSpacing == 'string') ls = parseFloat(this.fontStyle.letterSpacing.replace('px', ''));
//         else if (typeof this.fontStyle.letterSpacing == 'number') ls = this.fontStyle.letterSpacing;
//         return ls;
//     }
//     /**
//      * 获取文字的行高
//      */
//     get lineHeight() {
//         var lh = this.fontStyle.lineHeight;
//         if (typeof lh == 'number') return lh;
//         else if (typeof lh == 'string') return parseFloat(lh.replace('px', ''));
//     }
//     /**
//      * 测量文字区域
//      * @param width 文本区域宽度
//      * @returns TextRowSpan
//      * 
//      */
//     textRows() {
//         var ts = this.text.split('');
//         var lh = this.lineHeight;
//         var rows: TextRowSpan[] = [];
//         var row: TextRowSpan;
//         for (let i = 0; i < ts.length; i++) {
//             var word = ts[i];
//             if (word == '\n' || word == '\n\r') {
//                 if (row) row.end = i;
//                 row = { text: '', newline: true, start: i, end: i, width: 0, height: lh };
//                 rows.push(row);
//             }
//             else {
//                 var w = this.wordWidth(word);
//                 if (typeof row == 'undefined') {
//                     row = { text: '', start: i, end: i, width: 0, height: lh };
//                     rows.push(row);
//                 }
//                 if (row.width + w > this.width) {
//                     if (row) row.end = i;
//                     row = { text: word, start: i, end: i, width: w, height: lh };
//                     rows.push(row);
//                 }
//                 else {
//                     row.text += word;
//                     row.width += w;
//                     row.end = i;
//                 }
//             }

//         }
//         return rows;
//     }
//     /**
//      * 在offset位置返回文本的文字区域
//      *
//      * @param offset 
//      */
//     textRowsOffset(offset: { x: number, y: number }) {
//         var ts = this.text.split('');
//         var lh = this.lineHeight;
//         var rows: TextRowSpan[] = [];
//         var row: TextRowSpan;
//         var rowTotalCount = Math.floor(offset.y / lh);
//         for (let i = 0; i < ts.length; i++) {
//             var word = ts[i];
//             var w = this.wordWidth(word);
//             if (word == '\n' || word == '\n\r') {
//                 if (row) row.end = i;
//                 row = { text: '', newline: true, start: i, end: i, width: 0, height: lh };
//                 rows.push(row);
//             }
//             else {
//                 if (typeof row == 'undefined') {
//                     row = { text: '', start: i, end: i, width: 0, height: lh };
//                     rows.push(row);
//                 }
//                 if (row.width + w > this.width && rows.length < rowTotalCount - 1) {
//                     if (row) row.end = i;
//                     row = { text: word, start: i, end: i, width: w, height: lh };
//                     rows.push(row);
//                 }
//                 else if (row.width <= offset.x && row.width + w > offset.x && rows.length == rowTotalCount) {
//                     if (row.width + w / 2 > offset.x) {
//                         row.end = i;
//                         break;
//                     }
//                     else {
//                         row.text += word;
//                         row.width += w;
//                         row.end = i + 1;
//                         break;
//                     }
//                 }
//                 else {
//                     row.text += word;
//                     row.width += w;
//                     row.end = i;
//                 }
//             }
//         }
//         return rows;
//     }
//     /**
//      * 从当前的文字在pos位置水平走几步
//      * @param pos 所在的位置
//      * @param step 移动的位置
//      * 
//      */
//     walk(pos: number, step: number) {
//         pos += step;
//         var ts = this.text.split('');
//         if (pos < 0) return -1;
//         else if (pos > ts.length) return 1;
//         if (pos == 0) {
//             return [{ text: '', start: 0, end: 0, width: 0, height: lh }]
//         }
//         else if (pos > ts.length) {
//             pos = ts.length;
//         }
//         var lh = this.lineHeight;
//         var rows: TextRowSpan[] = [];
//         var row: TextRowSpan;
//         for (let i = 0; i < pos; i++) {
//             var word = ts[i];
//             if (word == '\n' || word == '\n\r') {
//                 if (row) row.end = i;
//                 row = { text: '', newline: true, start: i, end: i, width: 0, height: lh };
//                 rows.push(row);
//             }
//             else {
//                 var w = this.wordWidth(word);
//                 if (typeof row == 'undefined') {
//                     row = { text: '', start: i, end: i, width: 0, height: lh };
//                     rows.push(row);
//                 }
//                 if (row.width + w > this.width) {
//                     if (row) row.end = i;
//                     row = { text: word, start: i, end: i, width: w, height: lh };
//                     rows.push(row);
//                 }
//                 else {
//                     row.text += word;
//                     row.width += w;
//                     row.end = i;
//                 }
//             }
//         }
//         return rows;
//     }
//     addDown(pos: number, offset: number) {
//         var rows = this.walk(pos, 0);
//         if (Array.isArray(rows)) {
//             var currentRow = rows.length;
//             var offsetRow = currentRow + offset;
//             if (offsetRow < 0) {
//                 return -1;
//             }
//             else {
//                 var totalRows = this.textRows();
//                 if (offsetRow > totalRows.length) {
//                     return 1;
//                 }
//                 else return this.textRowsOffset({ x: rows.last().width, y: offsetRow * this.lineHeight + this.lineHeight / 2 })
//             }
//         }
//     }
//     /**
//      * 测量文本的宽度
//      * @param text 
//      */
//     textWidth(text: string) {
//         var ts = text.split('');
//         var width = 0;
//         for (let i = 0; i < ts.length; i++) {
//             let word = ts[i];
//             var w = this.wordWidth(word);
//             width += w;
//         }
//         return width;
//     }
//     /**
//      * 测量单个字符的宽度
//      * @param word 
//      * @param letterSpacing 自定义行高
//      */
//     wordWidth(word: string, letterSpacing?: number) {
//         if (word == '') return 0;
//         if (!__g) {
//             var canvas = document.createElement('canvas')//首先创建一个canvas标签
//             __g = canvas.getContext("2d");//把canvas的画笔给调出来
//             canvas.style.display = 'none';
//         }
//         var fontStyle = this.fontStyle;
//         __g.font = `${fontStyle.fontStyle} ${fontStyle.fontVariant} ${fontStyle.fontWeight} ${fontStyle.fontSize}/${fontStyle.lineHeight} ${fontStyle.fontFamily}`;
//         return __g.measureText(word).width + letterSpacing || this.letterSpacing;
//     }
// }

