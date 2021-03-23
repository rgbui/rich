
import { Block } from "../block/base";
import { Page } from "../page";
import { Anchor } from "./anchor";

import { SelectorView } from "./render/render";
import { BlockSelection } from "./selection";
export class Selector {
    selections: BlockSelection[] = [];
    page: Page;
    constructor(page: Page) {
        this.page = page;
    }
    /***
     * 选择器，用户点击，有拖动选择器的意图,这和用户直接点在page上还是有区别的
     * 这个拖动有可能是拖动选区的文字，拖动到别一个block中，
     * 也有可能是直接拖动block
     */
    mousedown(event: MouseEvent) {

        function mousemove(ev: MouseEvent) {

        }
        function mouseup(ev: MouseEvent) {
            try {

            }
            catch (e) {

            }
            finally {
                document.removeEventListener('mousemove', mousemove);
                document.removeEventListener('mouseup', mouseup);
            }
        }
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }
    onMouseLeave(event: MouseEvent) {

    }
    onMouseEnter(event: MouseEvent) {

    }
    onOperatorMousedown(event: MouseEvent) {
        var dx = 0, dy = 0;
        var dis = 3;
        var isMove = false;
        var self = this;
        function mousemove(ev: MouseEvent) {
            dx = ev.pageX - event.pageX;
            dy = ev.pageY - event.pageY;
            if (Math.abs(dx) > dis || Math.abs(dy) > dis) {
                isMove = true;
            }
        }
        function mouseup(ev: MouseEvent) {
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
            if (isMove == true) {

            }
            else {
                self.onOpenMenu(event);
            }
        }
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }
    onOpenMenu(event: MouseEvent) {

    }
    onKeydown(event: KeyboardEvent) {
        // console.log(event.key);
        // switch (event.key) {
        //     case 'ArrowDown':
        //     case 'ArrowUp':
        //     case 'ArrowLeft':
        //     case 'ArrowRight':
        //         this.onEndInput();
        //         this.onCursorMove(event.key);
        //         break;
        //     case "Enter":
        //         if (this.inputAnchor && this.inputAnchor.anchor.isEnd) {
        //             //创建换行的空白block
        //         }
        //         else {
        //             if (!this.inputAnchor) this.onStartInput()
        //             this.onInput(event);
        //         }
        //         break;
        //     case 'Delete':
        //     case 'Backspace':
        //         if (!this.inputAnchor || this.inputAnchor && this.inputAnchor.at == this.cursorAnchor.at) {
        //             this.onKeyDeleteOne(event);
        //         }
        //         else {
        //             this.onInput(event);
        //         }
        //     default:
        //         if (!this.inputAnchor) this.onStartInput()
        //         this.onInput(event);
        //         break;
        // }
    }
    /***
     * 光标移动
     */
    onCursorMove(arrow: 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight') {
        // var anchor = this.cursorAnchor;
        // switch (arrow) {
        //     case 'ArrowDown':
        //         var newBlock = this.cursorAnchor.block.selectorDownBlock(anchor.point.x);
        //         if (newBlock) {
        //             var newAnchor = newBlock.createAnchorByHorizontal(anchor.point.x, 'before');
        //             anchor.copy(newAnchor);
        //         }
        //         else return;
        //         break;
        //     case 'ArrowUp':
        //         var newBlock = this.cursorAnchor.block.selectorUpBlock(anchor.point.x);
        //         if (newBlock) {
        //             var newAnchor = newBlock.createAnchorByHorizontal(anchor.point.x, 'after');
        //             anchor.copy(newAnchor);
        //         }
        //         else return;
        //         break;
        //     case 'ArrowLeft':
        //         if (!anchor.isText || anchor.isText && anchor.isStart) {
        //             var prevBlock = anchor.block.selectorPrevBlock;
        //             if (prevBlock) {
        //                 var at = -2;
        //                 if (!anchor.block.isNeighborBlock(prevBlock, 'prev'))
        //                     at = -1;
        //                 var newAnchor = CreateAnchorByBlock(prevBlock, at, prevBlock.rightPart);
        //                 anchor.copy(newAnchor);
        //             }
        //             else return;
        //         }
        //         else anchor.locationByAt(anchor.at - 1);
        //         break;
        //     case 'ArrowRight':
        //         if (!anchor.isText || anchor.isText && anchor.isEnd) {
        //             console.log('ffgxxx');
        //             var nextBlock = this.cursorAnchor.block.selectorNextBlock;
        //             console.log(nextBlock, 'nb');
        //             if (nextBlock) {
        //                 var at = 1;
        //                 if (!anchor.block.isNeighborBlock(nextBlock, 'next')) at = 0;
        //                 var newAnchor = CreateAnchorByBlock(nextBlock, at, nextBlock.leftPart);
        //                 this.cursorAnchor.copy(newAnchor);
        //             }
        //             else return;
        //         }
        //         else anchor.locationByAt(anchor.at + 1);
        //         break;
        // }
        // this.view.forceUpdate();
    }
    onPaster(event: ClipboardEvent) {
        if (event.clipboardData.files && event.clipboardData.files.length > 0) {
            /**
             * 复制文件
             */
        }
    }
    private inputAnchor: { anchor: Anchor, at: number, content: string };
    onEndInput() {
        // if (typeof this.inputAnchor != 'undefined') delete this.inputAnchor;
        // if (this.view.textarea.value) this.view.textarea.value = '';
    }
    onStartInput() {
        if (typeof this.inputAnchor == 'undefined') {
            this.inputAnchor = {
                anchor: this.cursorAnchor,
                at: this.cursorAnchor.at,
                content: this.cursorAnchor.textContent
            }
        }
    }
    onInput(event: KeyboardEvent) {
        // var self = this;
        // console.log('ggg');
        // function keyup(ev: KeyboardEvent) {
        //     try {
        //         var value = self.view.textarea.value;
        //         var newContent = self.inputAnchor.content.slice(0, self.inputAnchor.at) + value + self.inputAnchor.content.slice(self.inputAnchor.at);
        //         self.inputAnchor.anchor.block.updatePartContent(self.inputAnchor.anchor.part ? self.inputAnchor.anchor.part.name : undefined, newContent);
        //         self.inputAnchor.anchor.el.innerHTML = getContentHtml(newContent);
        //         self.inputAnchor.anchor.locationByAt(self.inputAnchor.at + value.length, true);
        //         self.view.forceUpdate();
        //     }
        //     catch (e) {
        //         console.log(e);
        //     }
        //     finally {
        //         self.view.textarea.removeEventListener('keyup', keyup)
        //     }
        // }
        // this.view.textarea.addEventListener('keyup', keyup);
    }
    onKeyDeleteOne(event: KeyboardEvent) {
        // console.log(this.cursorAnchor.at, this.cursorAnchor);
        // if (this.cursorAnchor.at == 0) {
        //     //说明删了到最后一位了,这个会定位到当前block上面的一个block，
        //     /**
        //      * 需要注意，如果当前的blockcontent是空的，那么可能需要考虑删除block
        //      */
        // }
        // else if (this.cursorAnchor.at > 0) {
        //     var textContent = this.cursorAnchor.textContent;
        //     textContent = textContent.slice(0, this.cursorAnchor.at - 1) + textContent.slice(this.cursorAnchor.at);
        //     this.cursorAnchor.el.innerHTML = getContentHtml(textContent);
        //     this.cursorAnchor.locationByAt(this.cursorAnchor.at - 1, true);
        //     this.view.forceUpdate();
        // }
    }
    /**
     * 捕获聚焦
     * 光标中的textarea在鼠标点击在别处mousedown时，会失焦
     * 所以在点击mouseup时，需要重新聚焦
     */
    onTextInputRestartCaptureFocus() {
        if (this.view && this.view.textInput) {
            this.view.textInput.onFocus();
        }
    }
    // isInOverBlockOperator(ele: HTMLElement) {
    //     if (ele && this.view && this.view.operatorElement) {
    //         return this.view.operatorElement.contains(ele);
    //     }
    //     return false;
    // }
    onOverBlock() {
        this.view.forceUpdate();
    }
    /**
     * 获取选区中所包含的block
     * 1. 选中中所涉及到的文字选区block
     * 2. 一个选区构成一个矩形，与矩形有相交的block
     */
    get blocks(): Block[] {
        return [];
    }
    view: SelectorView;
    get cursorAnchor(): Anchor {
        var sel = this.selections.last();
        if (sel) {
            if (sel.end) return sel.end;
            else if (sel.start) return sel.start;
        }
        return undefined;
    }
    /***
     * 仅仅只是一个anchor，而不是选区
     */
    get isOnlyAnchor() {
        if (this.selections.length == 1) {
            if (this.selections.first().start && !this.selections.first().end) return true;
            else if (this.selections.first().end && !this.selections.first().start) return true;
        }
        return false;
    }
    /**
     * 是选区
     */
    get isSelection() {
        return !this.isOnlyAnchor;
    }
}

