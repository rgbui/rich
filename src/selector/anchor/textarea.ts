
// import { util } from "../../util/util";
// import { Point } from "../../common/point";

// let __g: CanvasRenderingContext2D;
// /***
//  * 文字域内
//  * 主要是计算文字中光标移动
//  * 光标点在什么位置上
//  * 文字域内的文字会换行，
//  * 换行可能是一行文字排不下了，还有可能是换行符
//  * 另外形成的多行文字中，首行可能会有一定的距离，
//  * 比如一段文字中的某一小片文字(code)，这一小片文字被点击了，
//  * 其首行的距离是最外层blockElement的偏离距离，第二行则从blockElement开始计算
//  * 
//  */
// export class TextArea {
//     el: HTMLElement;
//     blockElement: HTMLElement;
//     constructor(el: HTMLElement, blockElement?: HTMLElement) {
//         this.el = el;
//         this.blockElement = blockElement;
//     }
//     get fontStyle() {
//         return getEleFontStyle(this.el);
//     }
//     rows: TextAreaRow[];
//     cacTextAreaRows() {
//         var text = this.textContent;
//         var ts = text.split('');
//         var rows: TextAreaRow[] = [];
//         var row: TextAreaRow;
//         var firstRowWidth: number, firstRowX: number;
//         var rowWidth: number, rowX: number;
//         if (typeof this.blockElement != 'undefined') {
//             var bound = this.blockElement.getBoundingClientRect();
//             var eleBound = getEleContentBound(this.el);
//             firstRowWidth = bound.left + bound.width - eleBound.left;
//             firstRowX = eleBound.left;
//             rowWidth = bound.width;
//             rowX = bound.left;
//         }
//         else {
//             var bound = getEleContentBound(this.el) as DOMRect;
//             rowWidth = bound.width;
//             rowX = bound.left;
//             firstRowX = bound.left;
//             firstRowWidth = bound.width;
//         }
//         for (let i = 0; i < ts.length; i++) {
//             var word = ts[i];
//             /**
//              * https://zhidao.baidu.com/question/386412786.html
//              */
//             if (word == '\n' || word == '\r') {
//                 if (typeof row == 'undefined') {
//                     row = new TextAreaRow();
//                     row.x = firstRowX;
//                     rows.push(row);
//                     row.isEndLine = true;
//                 }
//                 else
//                     row.isEndLine = true;
//                 row = new TextAreaRow();
//                 row.x = rowX;
//                 rows.push(row);
//                 /**
//                  * 如果是\r\n
//                  */
//                 if (ts[i + 1] == '\n' && word == '\r') {
//                     i += 1;
//                 }
//             }
//             else {
//                 var w = this.wordWidth(word);
//                 if (typeof row == 'undefined') {
//                     row = new TextAreaRow();
//                     row.x = firstRowX;
//                     row.push(i, w);
//                     rows.push(row);
//                 }
//                 else if (rows.length == 1 && row.width + w > firstRowWidth) {
//                     row = new TextAreaRow();
//                     row.x = rowX;
//                     row.push(i, w);
//                     rows.push(row);
//                 }
//                 else if (rows.length > 1 && row.width + w > rowWidth) {
//                     row = new TextAreaRow();
//                     row.x = rowX;
//                     row.push(i, w);
//                     rows.push(row);
//                 }
//                 else row.push(i, w);
//             }
//         }
//         this.rows = rows;
//     }
//     get textContent() {
//         return getEleContent(this.el);
//     }
//     location(originPoint: Point) {
//         if (!this.rows) this.cacTextAreaRows();
//         var bound = getEleContentBound(this.el);
//         var dy = originPoint.y - bound.top;
//         var lineHeight: number = this.fontStyle.lineHeight as any;
//         if (typeof lineHeight == 'string') lineHeight = parseFloat((lineHeight as any).replace('px', ''))
//         if (typeof lineHeight != 'number') {
//             throw 'the line height is not number';
//         }
//         var rowCount = Math.ceil(dy / lineHeight) - 1;
//         var rows = this.rows;
//         if (rowCount < 0) rowCount = 0;
//         else if (rowCount >= rows.length) rowCount = rows.length - 1;
//         var row = rows[rowCount];
//         var co = row.cacOffset(originPoint.x);
//         return {
//             y: bound.top + rowCount * lineHeight,
//             at: co.at,
//             x: row.x + co.width
//         }
//     }
//     locationByAt(at: number, forceRows?: boolean) {
//         if (!this.rows || forceRows == true) this.cacTextAreaRows();
//         var bound = getEleContentBound(this.el);
//         var lineHeight: number = this.fontStyle.lineHeight as any;
//         if (typeof lineHeight == 'string') lineHeight = parseFloat((lineHeight as any).replace('px', ''))
//         if (typeof lineHeight != 'number') {
//             throw 'the line height is not number';
//         }
//         for (var i = 0; i < this.rows.length; i++) {
//             var row = this.rows[i];
//             if (row.words.exists(g => g.at == at)) {
//                 var w = row.words.findAll(x => x.at < at).sum(g => g.width);
//                 return {
//                     y: bound.top + i * lineHeight,
//                     at: at,
//                     x: row.x + w
//                 }
//             }
//         }
//         var lastRow = this.rows.last();
//         if (!lastRow) {
//             console.log('fontStyle', this.rows, this, this.fontStyle);
//         }
//         if (at == lastRow.words.last().at + 1) {
//             return {
//                 y: bound.top + (this.rows.length - 1) * lineHeight,
//                 at,
//                 x: lastRow.x + lastRow.words.sum(x => x.width)
//             }
//         }
//     }
//     private wordWidth(word: string): number {
//         if (word == '') return 0;
//         if (!__g) {
//             var canvas = document.createElement('canvas')//首先创建一个canvas标签
//             __g = canvas.getContext("2d");//把canvas的画笔给调出来
//             canvas.style.display = 'none';
//         }
//         var fontStyle = this.fontStyle;
//         var lineHeight: string = fontStyle.lineHeight as any;
//         if (typeof lineHeight == 'number') lineHeight = lineHeight + 'px';
//         __g.font = `${fontStyle.fontStyle} ${fontStyle.fontVariant} ${fontStyle.fontWeight} ${fontStyle.fontSize}/${lineHeight} ${fontStyle.fontFamily}`;
//         var ls = 0;
//         if (typeof fontStyle.letterSpacing != 'number') {
//             ls = parseFloat((fontStyle.letterSpacing as any).replace('px', ''));
//             if (isNaN(ls)) ls = 0;
//         }
//         else ls = fontStyle.letterSpacing;
//         return __g.measureText(word).width + ls;
//     }
// }
// export class TextAreaRow {
//     x: number;
//     y: number;
//     words: TextAreaWord[] = [];
//     isEndLine: boolean = false;
//     push(at: number, width: number) {
//         var tw = new TextAreaWord();
//         tw.at = at;
//         tw.row = this;
//         tw.width = width;
//         this.words.push(tw);
//     }
//     get width() {
//         return this.words.sum(x => x.width)
//     }
//     cacOffset(offset: number) {
//         var dx = offset - this.x;
//         if (dx > this.width) return { at: this.words.last().at + 1, width: this.width };
//         var w = 0;
//         var at = this.words.first().at;
//         for (var i = 0; i < this.words.length; i++) {
//             var wo = this.words[i];
//             if (w + wo.width >= dx && w < dx) {
//                 if (w + wo.width / 2 >= dx) {
//                     at = wo.at;
//                 }
//                 else {
//                     at = wo.at + 1;
//                     w += wo.width;
//                 }
//                 break;
//             }
//             else w += wo.width;
//         }
//         return { at, width: w };
//     }
// }
// export class TextAreaWord {
//     at: number;
//     width: number;
//     row: TextAreaRow;
// }
// export type TextFontStyle = {
//     fontStyle: string,
//     fontVariant: string,
//     fontWeight: string,
//     fontSize: string,
//     lineHeight: number,
//     fontFamily: string,
//     letterSpacing?: number,
//     /**
//      * 文字颜色，即光标颜色
//      */
//     color?: string
// }
// export function getEleFontStyle(ele: HTMLElement): TextFontStyle {
//     try {
//         var fontStyle = {
//             fontStyle: util.getStyle(ele, 'fontStyle'),
//             fontVariant: util.getStyle(ele, 'fontVariant'),
//             fontWeight: util.getStyle(ele, 'fontWeight'),
//             fontSize: util.getStyle(ele, 'fontSize'),
//             lineHeight: util.getStyle(ele, 'lineHeight'),
//             fontFamily: util.getStyle(ele, 'fontFamily'),
//             letterSpacing: util.getStyle(ele, 'letterSpacing'),
//             color: util.getStyle(ele, 'color')
//         };
//         fontStyle.lineHeight = parseInt(fontStyle.lineHeight.replace('px', ''));
//         fontStyle.letterSpacing = parseInt(fontStyle.letterSpacing.replace('px', ''));
//         if (isNaN(fontStyle.letterSpacing)) fontStyle.letterSpacing = 0;
//         return fontStyle;
//     } catch (e) {
//         console.log(e);
//         console.log(ele);
//         throw e;
//     }
// }
// export function getEleContentBound(ele: HTMLElement) {
//     var bound = ele.getBoundingClientRect();

//     function getValue(name) {
//         var v = util.getStyle(ele, name);
//         if (typeof v == 'string') {
//             var g = parseFloat(v.replace('px', ''));
//             if (isNaN(g)) return 0;
//             else return g;
//         }
//         else if (typeof v == 'number') return v;
//         else return 0;
//     }
//     return {
//         top: bound.top + getValue('paddingTop') + getValue('borderTopWidth'),
//         left: bound.left + getValue('paddingLeft') + getValue('borderLeftWidth'),
//         width: bound.width - (getValue('paddingLeft') - getValue('paddingRight') - getValue('borderLeftWidth') - getValue('borderRightWidth')),
//         height: bound.height - (getValue('paddingTop') - getValue('paddingBottom') - getValue('borderTopWidth') - getValue('borderBottomWidth'))
//     }
// }
// export function getEleContent(ele: HTMLElement) {
//     var text = ele.innerHTML;
//     text = text.replace(/<br[\s]*\/>/g, "\n");
//     text = text.replace(/<i[^>]*>[\s]*<\/i>/g, '');
//     return text;
// }
// export function getContentHtml(content: string) {
//     var c = content;
//     if (!c) c = '';
//     c = c.replace(/ /g, "&nbsp;");
//     c = c.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
//     c = c.replace(/</, "&lt;");
//     c = c.replace(/>/, "&gt;");
//     c = c.replace(/\r\n?|\n/g, '<br/>');
//     return c;
// }
