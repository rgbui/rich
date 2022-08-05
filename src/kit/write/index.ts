import lodash from "lodash";
import React from "react";
import { Kit } from "..";
import { InputTextPopSelector, InputTextPopSelectorType } from "../../../extensions/common/input.pop";
import { forceCloseTextTool, useTextTool } from "../../../extensions/text.tool";
import { UA } from "../../../util/ua";
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
import { findBlockAppear, findBlocksBetweenAppears } from "../../block/appear/visible.seek";
import { BlockUrlConstant } from "../../block/constant";
import { BlockCssName } from "../../block/pattern/css";
import { MouseDragger } from "../../common/dragger";
import { KeyboardCode } from "../../common/keys";
import { TextEle } from "../../common/text.ele";
import { Point, Rect } from "../../common/vector/point";
import { ActionDirective } from "../../history/declare";
import { PageLayoutType } from "../../page/declare";
import { inputBackspaceDeleteContent, inputBackSpaceTextContent, inputDetector, inputLineTail, inputPop, keydownBackspaceTextContent } from "./input";
import { MoveCursor, onEnterInput, onKeyTab, predictKeydown } from "./keydown";
import { onPaste } from "./paste";
import { AutoInputStore, InputForceStore, InputStore } from "./store";

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
    async mousedown(aa: AppearAnchor, event: React.MouseEvent) {
        this.isCompositionstart = false;
        var sel = window.getSelection();
        var rowBlock = aa.block.closest(x => x.isBlock);
        if (rowBlock.isFreeBlock && !(sel.focusNode && rowBlock.el.contains(sel.focusNode))) {
            event.preventDefault();
            return;
        }
        this.kit.operator.onClearPage();
        event.stopPropagation();
        var anchorNode;
        var anchorOffset;
        var self = this;
        /**
         * 光标的位置刚触发mousedown时，并不准确，
         * 而且mouseup还没触发时，其实就有了光标位置
         * 
         */
        var cr = TextEle.getCursorRangeByPoint(Point.from(event));
        if (cr?.node && aa.el.contains(cr?.node)) {
            this.onInputStart(aa, cr.offset);
        }
        else setTimeout(() => {
            self.onSaveSelection();
        }, 100);
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
                    anchorNode = aa.firstTextNode;
                }
            },
            move(ev, data) {
                var currentAppear = findBlockAppear(ev.target);
                if (currentAppear && currentAppear !== aa) {
                    currentAppear.collapseByPoint(Point.from(ev), { startNode: anchorNode, startOffset: anchorOffset });
                }
            },
            moveEnd(ev, isMove, data) {
                self.onSaveSelection();
                if (isMove) {
                    if (!sel.isCollapsed) {
                        self.onOpenTextTool();
                    }
                }
            }
        })
    }
    mouseup(aa: AppearAnchor, event: React.MouseEvent) {

    }
    /**
     * 注意点:event.preventDefault() 在触发前最好不要有执行async的操作，否则会失效
     */
    async keydown(aa: AppearAnchor, event: React.KeyboardEvent) {
        var sel = window.getSelection();
        /**
         * 判断是否阻止输入
         */
        if (predictKeydown(this, aa, event) == false) { event.preventDefault(); return; }
        /**
         * 这里如果当前的按键事件触发了，那么这里将不做任何处理。
         * keyboardPlate是处于capture模式，是先触发的，这里做拦截，由页面去处理
         */
        if (this.kit.page.keyboardPlate.isPredict()) { event.preventDefault(); return; }
        /**
         * 这里判断是光标、选区、还是选择多行块
         */
        var hasSelectionRange: boolean = false;
        if (this.kit.operator.currentSelectedBlocks.length > 0) hasSelectionRange = true;
        else if (!sel.isCollapsed) hasSelectionRange = true;
        switch (event.key.toLowerCase()) {
            case KeyboardCode.ArrowDown.toLowerCase():
            case KeyboardCode.ArrowUp.toLowerCase():
            case KeyboardCode.ArrowLeft.toLowerCase():
            case KeyboardCode.ArrowRight.toLowerCase():
                await AutoInputStore();
                MoveCursor(this,aa,event);
                return;
                break;
            case KeyboardCode.Enter.toLowerCase():
                if (this.kit.page.requireSelectLayout == true) {
                    event.preventDefault();
                    this.kit.page.onPageTurnLayout(PageLayoutType.doc, async () => {
                        var lastBlock = this.kit.page.findReverse(g => g.isBlock);
                        var newBlock: Block;
                        if (lastBlock && lastBlock.parent == this.kit.page.views.last()) {
                            newBlock = await this.kit.page.createBlock(BlockUrlConstant.TextSpan, {}, lastBlock.parent, lastBlock.at + 1);
                        }
                        else {
                            newBlock = await this.kit.page.createBlock(BlockUrlConstant.TextSpan, {}, this.kit.page.views.last());
                        }
                        newBlock.mounted(() => {
                            this.kit.writer.onFocusBlockAnchor(newBlock, { last: true });
                        })
                    });
                    return;
                }
                if (aa.block.isEnterCreateNewLine) {
                    if (!this.kit.page.keyboardPlate.isShift()) {
                        await onEnterInput(this, aa, event);
                    }
                    else if (this.kit.page.keyboardPlate.isShift() && aa.block.isDisabledInputLine) {
                        await onEnterInput(this, aa, event);
                    }
                }
                break;
            case KeyboardCode.Delete.toLowerCase():
            case KeyboardCode.Backspace.toLowerCase():
                //这里删除选区的内容
                if (hasSelectionRange) await inputBackspaceDeleteContent(this, aa, event)
                else await keydownBackspaceTextContent(this, aa, event);
                break;
            case KeyboardCode.Tab.toLowerCase():
                if (aa.block.closest(x => x.isListBlock)) {
                    await onKeyTab(this, aa, event);
                }
                break;
            case KeyboardCode.X.toLowerCase():
                if (UA.isMacOs && this.kit.page.keyboardPlate.isMeta() || !UA.isMacOs && this.kit.page.keyboardPlate.isCtrl())
                {
                    inputBackspaceDeleteContent(this,aa,event,{cut:true})
                    forceCloseTextTool();
                }
                break;
        }
    }
    input(aa: AppearAnchor, event: React.FormEvent) {
        if (this.isCompositionstart == true) return;
        this.textInput(aa, event);
    }
    focus(aa: AppearAnchor, event: React.FocusEvent) {
        aa.focus();
    }
    blur(aa: AppearAnchor, event: React.FocusEvent) {
        aa.blur();
    }
    paste(aa: AppearAnchor, event: React.ClipboardEvent) {
        onPaste(this.kit, aa, event.nativeEvent);
    }
    dblclick(aa: AppearAnchor, event: React.MouseEvent) {
        this.onSelectionAll(aa);
    }
    isCompositionstart: boolean = false;
    compositionstart(aa: AppearAnchor, event: React.CompositionEvent) {
        this.isCompositionstart = true;
    }
    compositionupdate(aa: AppearAnchor, event: React.CompositionEvent) {
        this.isCompositionstart = true;
    }
    compositionend(aa: AppearAnchor, event: React.CompositionEvent) {
        this.isCompositionstart = false;
        this.textInput(aa, event);
    }
    async textInput(aa: AppearAnchor, event: React.CompositionEvent | React.FormEvent<Element>) {
        var inputEvent = event.nativeEvent as InputEvent;
        if (aa.isSolid) {
            this.onSolidInputCreateTextBlock(aa, event);
            return;
        }
        /**
         * 这里需要判断是否有必要弹出弹窗
         */
        if (await inputPop(this, aa, event)) { }
        /**
         * 这里需要判断当前的输入文字是否有必要触发替换的问题
         */
        else if (await inputDetector(this, aa, event)) { return; }
        /**
         * 这里判断是否为删除性的输入 
         * https://developer.mozilla.org/zh-CN/docs/Web/API/InputEvent/inputType
         */
        else if (inputEvent.inputType == 'deleteContentBackward' && await inputBackSpaceTextContent(this, aa, event)) { return; }
        /**
         * 这里判断是否为输入到当前line块的末尾，且为当前row块的尾部。
         * 因为这样会导致输入的时候一直输入到line块中，或者空格一下  该功能暂时不做
         */
        else if (await inputLineTail(this, aa, event)) { }
        await InputStore(aa);
    }
    /***
     * 对外开放的事件
     */
    startAnchor: AppearAnchor;
    startOffset: number;
    endAnchor: AppearAnchor;
    endOffset: number;
    endAnchorText: string = '';
    onInputStart(aa: AppearAnchor, offset?: number) {
        this.kit.page.notifyViewCursor(aa, offset);
        aa.focus();
        this.startAnchor = aa;
        this.startOffset = typeof offset == 'number' ? offset : (window.getSelection()).anchorOffset;
        this.endAnchor = this.startAnchor;
        this.endOffset = this.startOffset;
        this.endAnchorText = this.endAnchor.textContent;
    }
    /**
     * 
     * 将光标移到block中的某个appearAnchor中
     */
    onFocusBlockAnchor(block: Block, options?: { last?: boolean }) {
        var acs = block.appearAnchors;
        if (acs.length > 0) {
            if (options?.last) this.onFocusAppearAnchor(acs.last(), { last: true });
            else this.onFocusAppearAnchor(acs.first());
        }
        else {
            if (options?.last) {
                var g = block.findReverse(g => g.appearAnchors.length > 0);
                if (g) this.onFocusAppearAnchor(g.appearAnchors.last(), { last: true })
            }
            else {
                var g = block.find(g => g.appearAnchors.length > 0, true);
                if (g) this.onFocusAppearAnchor(g.appearAnchors.first())
            }
        }
    }
    /**
     * 这里指定将光标移到appearAnchor的最前面或者最后面
     */
    onFocusAppearAnchor(aa: AppearAnchor, options?: { at?: number, last?: boolean | number, left?: number, y?: number }) {
        var sel = window.getSelection();
        if (typeof options?.left == 'number') {
            var bounds = TextEle.getBounds(aa.el);
            var lineHeight = TextEle.getLineHeight(aa.el);
            var y = options?.last ? Math.min(bounds.last().bottom - lineHeight / 2, options.y) : Math.max(options.y, bounds.first().top + lineHeight / 2);
            aa.collapseByPoint(new Point(options.left, y))
            this.onInputStart(aa, sel.focusOffset);
        }
        else {
            var pos = 0;
            if (options?.last && aa.isText) pos = aa.textContent.length + (typeof options.last == 'number' ? options.last : 0);
            else pos = options?.at || 0;
            /**
             * 这里需要加个empty,
             * 因为重复点击某个位置，该光标会消失，原因未知
             */
            sel.empty();
            aa.collapse(pos);
            this.onInputStart(aa, sel.focusOffset);
        }
    }
    /**
     * 通过AppearAnchor来选中当前行
     * @param aa
     */
    onSelectionAll(aa: AppearAnchor) {
        var block = aa.block;
        if (block.isLine) block = block.closest(x => !x.isLine);
        var firstAppear = block.find(g => g.appearAnchors.length > 0, true)?.appearAnchors.find(g => true);
        var lastAppear = block.findReverse(g => g.appearAnchors.length > 0, true)?.appearAnchors.findLast(g => true);
        if (firstAppear && lastAppear) {
            var sel = window.getSelection();
            sel.setBaseAndExtent(firstAppear.firstTextNode, 0, lastAppear.lastTextNode, lastAppear.lastTextNode.textContent.length)
        }
    }
    onSaveSelection() {
        var sel = window.getSelection();
        this.startAnchor = findBlockAppear(sel.anchorNode);
        this.startOffset = this.startAnchor.getCursorOffset(sel.anchorNode, sel.anchorOffset);
        this.endAnchor = findBlockAppear(sel.focusNode);
        this.endOffset = this.endAnchor.getCursorOffset(sel.focusNode, sel.focusOffset);
        this.endAnchorText = this.endAnchor?.textContent || '';
        this.kit.page.notifyViewCursor(this.endAnchor, this.endOffset);
    }
    onRenderSelection() {
        var sel = window.getSelection();
        if (this.startAnchor && this.endAnchor) {
            var cr = this.startAnchor.cacCollapseFocusPos(this.startOffset);
            var er = this.endAnchor.cacCollapseFocusPos(this.endOffset);
            sel.setBaseAndExtent(cr.node, cr.pos, er.node, er.pos);
        }
        else if (this.startAnchor) {
            this.startAnchor.collapse(this.startOffset);
        }
    }
    async onOpenTextTool() {
        var sel = window.getSelection();
        var range = sel.getRangeAt(0);
        if (range) {
            this.onSaveSelection();
            var rs = TextEle.getWindowCusorBounds();
            while (true) {
                var list = findBlocksBetweenAppears(this.startAnchor.el, this.endAnchor.el);
                var blocks = lodash.identity(list.map(l => l.block));
                if (blocks.some(s => !s.isSupportTextStyle)) return;
                var turnBlock: Block = undefined;
                if (blocks.every(b => b.isLine)) {
                    turnBlock = blocks[0].parent;
                    if (!blocks.every(b => b.parent == turnBlock)) {
                        turnBlock = undefined;
                    }
                }
                else if (blocks.length == 1) {
                    turnBlock = blocks[0].closest(x => !x.isLine);
                }
                var result = await useTextTool(
                    { roundAreas: rs, relativeEleAutoScroll: this.endAnchor.el },
                    { style: this.kit.page.pickBlocksTextStyle(blocks), turnBlock }
                );
                if (result) {
                    if (result.command == 'setStyle') {
                        await this.onSelectionSetPatternOrProps(list, result.styles);
                    }
                    else if (result.command == 'setProp') {
                        await this.onSelectionSetPatternOrProps(list, undefined, result.props);
                    }
                    else if (result.command == 'turn') {
                        await turnBlock.onClickContextMenu(result.item, result.event);
                        break;
                    }
                    else if (result.command == 'setEquation') {
                        await this.onSelectionEquation(list, result.props);
                        break;
                    }
                    else break;
                }
                else break;
            }
        }
    }
    /***
     * 输入式的弹窗
     */
    inputPop: { aa: AppearAnchor, type: InputTextPopSelectorType, selector: InputTextPopSelector, offset: number, rect: Rect } = null;
    /**
     * 
     * 如果@blockData 是 isLine ,则在指定的appear某处@offset插入一个新的block(@blockData)
     * 如果块，则在appear下面一行插入，如果appear本身是空的文本，则替换自身，在下面插入
     */
    async onInputPopCreateBlock(...args: any[]) {
        var inputPopHandle = async (offset: number,
            blockData: { isLine?: boolean, createPage?: boolean, url: string }) => {
            await InputForceStore(this.inputPop.aa, async () => {
                var aa = this.inputPop.aa;
                var newBlock: Block;
                var bd = lodash.cloneDeep(blockData);
                delete bd.isLine;
                delete bd.url;
                if (blockData.isLine) {
                    /**
                     * 说明创建的是行内块
                     */
                    newBlock = await aa.block.visibleRightCreateBlock(offset, blockData.url, { ...bd, createSource: 'InputBlockSelector' });
                }
                else {
                    /**
                     * 判断是否为空行块，如果是空行块，则将当前的块转用
                     * 否则创建一个换行块
                     */
                    var row = aa.block.closest(g => g.isBlock);
                    if (row.isContentEmpty) {
                        newBlock = await aa.block.visibleDownCreateBlock(blockData.url, { ...bd, createSource: 'InputBlockSelector' });
                        //说明是空白的textBlock
                        await row.delete();
                    }
                    else {
                        newBlock = await aa.block.visibleDownCreateBlock(blockData.url, { ...bd, createSource: 'InputBlockSelector' });
                    }
                    if (aa.block.isLine && aa.block.isContentEmpty) {
                        await aa.block.delete();
                    }
                }
                newBlock.mounted(() => {
                    this.onFocusBlockAnchor(newBlock, { last: true })
                });
            });
        }
        var blockData = args[0];
        var sel = window.getSelection();
        var aa = this.inputPop.aa;
        var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
        var content = aa.textContent;
        var textContent = content.slice(0, this.inputPop.offset) + content.slice(offset);
        aa.setContent(textContent);
        aa.collapse(offset);
        await inputPopHandle(this.inputPop.offset, blockData);
        this.inputPop = null;

    }
    async onSelectionSetPatternOrProps(
        appears: AppearAnchor[],
        styles: Record<BlockCssName, Record<string, any>>,
        props?: Record<string, any>
    ) {
        await this.kit.page.onAction(ActionDirective.onUpdatePattern, async () => {
            await appears.eachAsync(async appear => {
                if (appear == this.startAnchor || appear == this.endAnchor) {

                }
                else {
                    var block = appear.block;
                    if (styles) block.pattern.setStyles(styles);
                    if (props) await block.updateProps(props);
                }
            });
            if (this.endAnchor === this.startAnchor && this.endOffset < this.startOffset || TextEle.isBefore(this.endAnchor.el, this.startAnchor.el)) {
                [this.startAnchor, this.endAnchor] = [this.endAnchor, this.startAnchor];
                [this.startOffset, this.endOffset] = [this.endOffset, this.startOffset];
            }
            var nstart: Block;
            var nend: Block;
            if (this.startAnchor === this.endAnchor) {
                var rs = await this.startAnchor.split([this.startOffset, this.endOffset]);
                if (this.startOffset == 0) { nstart = rs.first(); nend = rs.first() }
                else {
                    nstart = rs[1]; nend = rs[1]
                }
                if (styles) { nstart.pattern.setStyles(styles); }
                if (props) { await nstart.updateProps(props); }
            }
            else {
                var ss = await this.startAnchor.split([this.startOffset]);
                nstart = ss.last();
                var es = await this.endAnchor.split([this.endOffset]);
                nend = es.first();
                if (styles) { nstart.pattern.setStyles(styles); nend.pattern.setStyles(styles); }
                if (props) { await nstart.updateProps(props); await nend.updateProps(props); }
            }
            this.kit.page.addUpdateEvent(async () => {
                this.startAnchor = nstart.appearAnchors.first();
                this.startOffset = 0;
                this.endAnchor = nend.appearAnchors.first();
                this.endOffset = this.endAnchor.textContent.length;
                this.endAnchorText = this.endAnchor.textContent;
                this.onRenderSelection();
            });
        });
    }
    async onSelectionEquation(appears: AppearAnchor[], props: { equation: boolean }) {
        await this.kit.page.onAction(ActionDirective.onUpdateEquation, async () => {
            await appears.eachAsync(async appear => {
                if (appear == this.startAnchor || appear == this.endAnchor) {

                }
                else {
                    var block = appear.block;
                    if (props.equation == true) {
                        if (block.url != BlockUrlConstant.KatexLine)
                            await block.turn(BlockUrlConstant.KatexLine)
                    }
                    else {
                        if (block.url == BlockUrlConstant.KatexLine) {
                            await block.turn(BlockUrlConstant.Text);
                        }
                    }
                }
            });
            if (this.endAnchor === this.startAnchor && this.endOffset < this.startOffset || TextEle.isBefore(this.endAnchor.el, this.startAnchor.el)) {
                [this.startAnchor, this.endAnchor] = [this.endAnchor, this.startAnchor];
                [this.startOffset, this.endOffset] = [this.endOffset, this.startOffset];
            }
            var nstart: Block;
            var nend: Block;
            if (this.startAnchor === this.endAnchor) {
                var rs = await this.startAnchor.split([this.startOffset, this.endOffset]);
                if (this.startOffset == 0) { nstart = rs.first(); nend = rs.first() }
                else {
                    nstart = rs[1];
                    nend = rs[1]
                }
                if (props.equation) await nstart.turn(BlockUrlConstant.KatexLine)
                else await nstart.turn(BlockUrlConstant.Text);
            }
            else {
                var ss = await this.startAnchor.split([this.startOffset]);
                nstart = ss.last();
                var es = await this.endAnchor.split([this.endOffset]);
                nend = es.first();
                if (props.equation) { await nstart.turn(BlockUrlConstant.KatexLine); await nend.turn(BlockUrlConstant.KatexLine) }
                else { await nstart.turn(BlockUrlConstant.Text); await nstart.turn(BlockUrlConstant.Text) }
            }
            this.kit.page.addUpdateEvent(async () => {
                this.onFocusBlockAnchor(nend, { last: true });
            });
        });
    }
    async onSolidInputCreateTextBlock(aa: AppearAnchor, event?: React.CompositionEvent | React.FormEvent<Element>, forceText?: string) {
        await this.kit.page.onAction(ActionDirective.onSolidBlockInputTextContent, async () => {
            var text = aa.solidCursorEl.innerText;
            aa.solidCursorEl.innerHTML = '';
            var c = forceText ? forceText : text;
            var newBlock = await aa.block.parent.appendBlock({
                url: BlockUrlConstant.Text,
                content: c
            },
                aa.block.at + 1,
                aa.block.parentKey
            );
            this.kit.page.addUpdateEvent(async () => {
                this.kit.writer.onFocusBlockAnchor(newBlock, { last: true });
            });
        });
    }
}

