import { Kit } from "..";
import { Block } from "../../block";
import { Events } from "../../../util/events";
import { cacDragDirection, DropDirection } from "./direction";
import { HandleView } from "./view";

export class Handle extends Events {
    kit: Kit;
    view: HandleView;
    constructor(kit: Kit) {
        super();
        this.kit = kit;
    }
    handleBlock: Block;
    onShowBlockHandle(hoverBlock: Block) {
        if (!this.kit.page.isCanEdit) return;
        this.handleBlock = hoverBlock.handleBlock;
        if (this.handleBlock && this.handleBlock.isShowHandleBlock != true) return;
        var plusEl = this.view.handleEle.querySelector('.shy-selector-bar-plus') as HTMLElement;
        if (this.isDown) {
            var handleEl = this.view.handleEle;
            handleEl.style.display = 'none';
            plusEl.style.visibility = 'visible';
        }
        else if (this.handleBlock && !this.handleBlock.isFreeBlock) {
            var pos = this.handleBlock.getVisibleHandleCursorPoint();
            if (pos) {
                var handleEl = this.view.handleEle;
                var top = pos.y - 14;
                //top = pos.y;
                handleEl.style.top = top + 'px';
                handleEl.style.left = pos.x + 'px';
                handleEl.style.display = 'flex';
                if (this.handleBlock.isVisiblePlus()) {
                    plusEl.style.visibility = 'visible';
                }
                else {
                    plusEl.style.visibility = 'hidden';
                }
            }
        }
        else {
            var handleEl = this.view.handleEle;
            handleEl.style.display = 'none';
            plusEl.style.visibility = 'visible';
        }
        if (this.handleBlock?.isFreeBlock) {
            if (this.kit.boardLine.isConnectOther && this.kit.boardLine.line) this.kit.boardBlockHover.block = this.handleBlock;
            else this.kit.boardBlockHover.block = undefined;
            this.kit.boardBlockHover.forceUpdate();
        }
    }
    onCloseBlockHandle() {
        var handleEl = this.view.handleEle;
        handleEl.style.display = 'none';
        if (!this.isDown) delete this.handleBlock;
        if (this.kit.boardLine.isConnectOther && this.kit.boardLine.line) {
            this.kit.boardBlockHover.block = null;
            this.kit.boardBlockHover.forceUpdate();
        }
    }
    containsEl(el: HTMLElement) {
        return this.view.handleEle.contains(el);
    }
    dragBlocks: Block[] = [];
    dropBlock: Block;
    dropDirection: DropDirection;
    dropData: Record<string, any>;
    dropEl: HTMLElement;
    onDropOverBlock(willDropBlock: Block, event: MouseEvent) {
        if (willDropBlock) {
            var db = this.dragBlocks.find(g => {
                var r = g.find(g => g == willDropBlock, true);
                if (r) return true;
                else return false;
            });
            if (db) {
                willDropBlock = undefined;
            }
        }
        var dr = cacDragDirection(this.kit, this.dragBlocks, willDropBlock, event);
        if (dr.direction != DropDirection.none) {
            willDropBlock = dr.dropBlock;
        }
        else {
            willDropBlock = undefined;
        }
        if (willDropBlock && this.dragBlocks.some(s => s === willDropBlock)) return;
        if (willDropBlock) {
            if (this.dragBlocks.some(s => s.find(c => c == willDropBlock)) ? true : false) return
        }
        if (willDropBlock !== this.dropBlock && this.dropBlock) {
            this.dropBlock.dropLeave();
        }
        if (willDropBlock) {
            this.dropDirection = dr.direction;
            this.dropBlock = dr.dropBlock;
            this.dropData = dr.dropData;
            this.dropEl = dr.dropEl;
            this.dropBlock.dropEnter(this.dropDirection, this.dropEl);
        }
    }
    onDropEnd() {
        this.isDrag = false;
        this.isDown = false;
        if (this.dropBlock) {
            this.dropBlock.dropLeave();
        }
        this.dragBlocks = [];
        delete this.dropBlock;
        delete this.dropDirection;
    }
    async onDropBlock() {
        if (this.dragBlocks.length > 0 && this.dropBlock) {
            await this.kit.page.onBatchDragBlocks(this.dragBlocks, this.dropBlock, this.dropDirection,this.dropData);
        }
    }
    async onClickBlock(event: MouseEvent) {
        this.kit.anchorCursor.onSelectBlocks(this.dragBlocks, { render: true });
        await this.kit.page.onOpenMenu(this.dragBlocks, event);
    }
    isDown: Boolean;
    isDrag: boolean = false;
    /**
     * 直接拖动元素，没有通过把手
     * @param block 
     * @param event 
     */
    onDirectDrag(block: Block, event: MouseEvent, options?: {
        isOnlyDrag?: boolean;
        notDragFun?: (e: MouseEvent) => void;
    }) {
        this.handleBlock = block;
        this.view.onMousedown(event, options);
    }
}