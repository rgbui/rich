import React from "react";
import { Kit } from "..";
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
import { findBlockAppear } from "../../block/appear/visible.seek";
import { MouseDragger } from "../../common/dragger";
import { KeyboardCode } from "../../common/keys";
import { TextEle } from "../../common/text.ele";
import { Point } from "../../common/vector/point";
import { inputDetector, inputLineTail, inputPop } from "./input";
import { MoveCursor, predictKeydown } from "./keydown";
import { InputStore } from "./store";

/**
 * https://blog.csdn.net/mafan121/article/details/78519348
 * 
 * 
 * 光标定位：
 * 1.鼠标点点到编辑点时，那么就显示光标，但在board中，先选中块，双击进入编辑
 * 聚焦到编辑点时，触发一个事件focusAnchor
 * 2.鼠标没有点到编辑点时，需要查找附近的编辑点，如简单表格，单元格可支持点击创建一个空白的文本块
 * 
 * 光标的失焦：
 * 如文本块点上去聚焦，但如果文本块本身没有文件内容时，失焦时自动移除（如board中的文本块，则添加聚焦，失焦时，如果没有输入文本，则自动删除）
 * 失焦触发事件blurAnchor
 * 
 * 光标移动：
 * 1.行内块的前后水平移动，需要在当前行内查找相邻的行内块。没有相邻则转到块相邻查找
 * 2.行内块的垂直移动，这个先判断是否处于最后一行，或者最上一行。基本以视觉来计算（视觉计算考虑文档及白板的情况）
 * 每移动一下，触发事件moveAnchor
 * 光标的上下，左右移动时，本身也需要考虑不同的块来处理（例如简单表格、数据表格，单元格，思维导图），
 * 
 * 光标键入:
 * 1. 正常输入，如果延迟700ms毫秒，则直接保存，触发inputStoreAnchor事件，每输入一次触发inputAnchor事件
 * 2. 输入的内容触发了下拉框弹窗，下拉框弹窗需要跟随光标移动
 * 3. 输入的内容触发了替换机制，需要重新定位输入光标。
 * 4. 输入enter键，同时输入shift键。enter键可以会导致块被截断，如果是块的最前面输入、如果是块的最后面输入（可以会连续性的创建）
 * 5. 输入arrowDown,arrowLeft,arrrowRight,arrowUp，这里需要区分是否有弹窗，如果有弹窗，则弹窗处理，
 * 如果没有是否为默认行为，是否为块行
 * 6. 回退删除，需要检测在行内块删除最后一个字符，在块当前最后一个字符，
 * 例如列表list块，删除时会将list块切换成普通文本
 * 本身的回退改变了文本内容（实际上board块的文本大小发生了变化，需要触发事件通知）
 * 7. 输入ctrl+1可能是触发文档的事件，但输入的1有可能会被输入到当前的块中。
 * keydown事件触发
 * keydown会触发多次（如果手不松，会一直触发，所以整个过程前不是完整的keydown-keyup
     * 可能会是keydown-keydown-keydown-keyup
     * keydown-input keydown-input keydown-input-keyup
     * 注意keydown是要输入，input是输入完成，keyup不一定会触发
 */

export class PageWrite {
    constructor(public kit: Kit) { }
    mousedown(aa: AppearAnchor, event: React.MouseEvent) {
        this.kit.operator.onClearSelectBlocks();
        event.stopPropagation();
        var sel = window.getSelection();
        var anchorNode;
        var anchorOffset;
        var self = this;
        self.onInputStart(aa);
        MouseDragger({
            event,
            dis: 5,
            allowSelection: true,
            moveStart() {
                /**
                 * 鼠标刚按下，sel.anchorNode不一定有，
                 * 当有想选区的举动时，这时sel.anchorNode可能有了，如果没有就强算一个坐标
                 */
                anchorNode = sel.anchorNode;
                anchorOffset = sel.anchorOffset;
                if (!anchorNode) {
                    anchorNode = aa.textNode;
                    anchorOffset = TextEle.getAt(aa.el, Point.from(event));
                }
            },
            move(ev, data) {
                var findAppear = findBlockAppear(ev.target);
                if (findAppear) {
                    sel.setBaseAndExtent(anchorNode, anchorOffset, findAppear.textNode, TextEle.getAt(findAppear.el, Point.from(ev)))
                }
            },
            moveEnd(ev, isMove, data) {
                if (isMove) {
                    if (!sel.isCollapsed) {
                        self.onOpenTextTool();
                    }
                }
                else self.onInputStart(aa);
            }
        })
    }
    mouseup(aa: AppearAnchor, event: React.MouseEvent) {

    }
    private isWillInput: boolean;
    /**
     * 注意点:event.preventDefault() 在触发前最好不要有执行async的操作，否则会失效
     */
    async keydown(aa: AppearAnchor, event: React.KeyboardEvent) {
        this.isWillInput = false;
        /**
         * 判断是否阻止输入
         */
        if (predictKeydown(this, aa, event) == false) { event.preventDefault(); return; }
        /**
         * 这行好像不用也可以
         */
        if (this.kit.page.keyboardPlate.isPredict()) return;
        /**
         * 这里判断是光标、选区、还是选择多行块
         */
        var hasSelectionRange: boolean = false;
        if (hasSelectionRange) {

        }
        else {
            switch (event.key) {
                case KeyboardCode.ArrowDown:
                case KeyboardCode.ArrowUp:
                case KeyboardCode.ArrowLeft:
                case KeyboardCode.ArrowRight:
                    MoveCursor(this, aa, event);
                    return;
                    break;
                case KeyboardCode.Enter:
                    break;
                case KeyboardCode.Delete:
                case KeyboardCode.Backspace:
                    break;
                case KeyboardCode.Tab:
                    break;
            }
        }
        this.isWillInput = true;
    }
    async input(aa: AppearAnchor, event: React.FormEvent)
    {
        if (!this.isWillInput) return;
        /**
         * 这里需要判断是否有必要弹出弹窗
         */
        if (await inputPop(this, aa, event)) return;
        /**
         * 这里需要判断当前的输入文字是否有必要触发替换的问题
         */
        if (await inputDetector(this, aa, event)) return;
        /**
         * 这里判断是否为输入到当前line块的末尾，且为当前row块的尾部。
         * 因为这样会导致输入的时候一直输入到line块中，或者空格一下  该功能暂时不做
         */
        if (await inputLineTail(this, aa, event)) return;
        await InputStore(aa, aa.textContent, this.startAnchorText);
    }
    focus(aa: AppearAnchor, event: React.FocusEvent) {
        /**
         * 光标聚焦后，在重新点击就不起作用，用mousedown感觉更靠谱
         */
        //var sel = window.getSelection();
        // console.log('focus', aa, sel.focusNode, sel.focusOffset)
    }
    blur(aa: AppearAnchor, event: React.FocusEvent) {
        // console.log('blur', aa, event);
    }
    paste(aa: AppearAnchor, event: React.ClipboardEvent) {

    }
    dblclick(aa: AppearAnchor, event: React.MouseEvent) {
        this.onSelectionAll(aa);
    }
    compositionstart(aa: AppearAnchor, event: React.MouseEvent) {

    }
    compositionend(aa: AppearAnchor, event: React.MouseEvent) {

    }
    compositionupdate(aa: AppearAnchor, event: React.MouseEvent) {

    }
    /***
     * 对外开放的事件
     */
    startAnchor: AppearAnchor;
    startAnchorText: string = '';
    startOffset: number;
    onInputStart(aa: AppearAnchor) {
        this.startAnchor = aa;
        this.startAnchorText = this.startAnchor.textContent;
        var sel = window.getSelection();
        this.startOffset = sel.anchorOffset;
    }
    /**
     * 
     * 将光标移到block中的某个appearAnchor中
     */
    onFocusBlockAnchor(block: Block, options?: { last?: boolean }) {
        var acs = block.appearAnchors;
        if (options?.last) this.onFocusAppearAnchor(acs.last(), { last: true });
        else this.onFocusAppearAnchor(acs.first());
    }
    /**
     * 这里指定将光标移到appearAnchor的最前面或者最后面
     */
    onFocusAppearAnchor(aa: AppearAnchor, options?: { last?: boolean, left?: number }) {
        var sel = window.getSelection();
        if (typeof options?.left == 'number') {
            var bounds = TextEle.getBounds(aa.el);
            var lineHeight = TextEle.getLineHeight(aa.el);
            var y = options?.last ? bounds.last().bottom - lineHeight / 2 : bounds.first().top + lineHeight / 2;
            var pos = TextEle.getAt(aa.el, new Point(options.left, y));
            sel.collapse(aa.textNode, pos);
            this.onInputStart(aa);
        }
        else {
            if (options?.last) sel.collapse(aa.textNode, aa.textContent.length);
            else sel.collapse(aa.textNode, 0);
            this.onInputStart(aa);
        }
    }
    /**
     * 通过AppearAnchor来选中当前行
     * @param aa
     */
    onSelectionAll(aa: AppearAnchor) {
        var block = aa.block;
        if (block.isLine) block = block.closest(x => !x.isLine);
        var firstAppear = block.find(g => g.appearAnchors.length > 0 && g.appearAnchors.some(s => s.isText), true)?.appearAnchors.find(g => g.isText);
        var lastAppear = block.findReverse(g => g.appearAnchors.length > 0 && g.appearAnchors.some(s => s.isText), true)?.appearAnchors.findLast(g => g.isText);
        if (firstAppear && lastAppear) {
            var sel = window.getSelection();
            sel.setBaseAndExtent(firstAppear.textNode, 0, lastAppear.textNode, lastAppear.textContent.length)
        }
    }
    async onOpenTextTool() {
        // while (true) {
        //     var result = await useTextTool(this.getSelectionPoint(), {
        //         block: rowBlock,
        //        style: this.page.pickBlocksTextStyle(this.selectedBlocks)
        //    });
        //     if (result) {
        //         if (result.command == 'setStyle') {
        //             await this.onSelectionSetPatternOrProps(result.styles);
        //         }
        //         else if (result.command == 'setProp') {
        //              await this.onSelectionSetPatternOrProps(undefined, result.props);
        //         }
        //         else if (result.command == 'turn') {
        //              await rowBlock.onClickContextMenu(result.item, result.event);
        //             break;
        //         }
        //         else break;
        //     }
        //     else break;
        // }
    }
}

