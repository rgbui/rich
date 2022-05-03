import { Kit } from "..";
import { Block } from "../../block";
import { dom } from "../../common/dom";
import { Point } from "../../common/vector/point";
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
        this.handleBlock = hoverBlock.handleBlock;
        if (this.isDown) {
            var handleEl = this.view.handleEle;
            handleEl.style.display = 'none';
        }
        else if (this.handleBlock) {
            var bound = this.handleBlock.getVisibleContentBound();
            var pos = Point.from(bound);
            var handleEl = this.view.handleEle;
            handleEl.style.top = pos.y + 'px';
            handleEl.style.left = pos.x + 'px';
            handleEl.style.display = 'flex';
        }
        else {
            var handleEl = this.view.handleEle;
            handleEl.style.display = 'none';
        }
        if (this.handleBlock?.isFreeBlock) {
            if (this.kit.boardLine.isConnectOther && this.kit.boardLine.line)
                this.kit.boardBlockHover.block = this.handleBlock;
            else this.kit.boardBlockHover.block = undefined;
            this.kit.boardBlockHover.forceUpdate();
        }
        else {
            // if (this.isDown) {
            //     this.onDropOverBlock(hoverBlock.dropOverBlock, this.kit.operator.moveEvent);
            // }
        }
    }
    onCloseBlockHandle() {
        var handleEl = this.view.handleEle;
        handleEl.style.display = 'none';
        if (!this.isDown) delete this.handleBlock;
    }
    containsEl(el: HTMLElement) {
        return this.view.handleEle.contains(el);
    }
    dragBlocks: Block[] = [];
    dropBlock: Block;
    dropDirection: DropDirection;
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
        if (willDropBlock !== this.dropBlock && this.dropBlock) {
            dom(this.dropBlock.el).removeClass(g => g.startsWith('shy-block-drag-over'));
            this.kit.page.onDropLeaveBlock(this.dragBlocks, this.dropBlock, this.dropDirection);
        }
        if (willDropBlock) {
            this.dropDirection = dr.direction;
            this.dropBlock = dr.dropBlock;
            var direction = DropDirection[this.dropDirection];
            var className = 'shy-block-drag-over-' + direction;
            if (!this.dropBlock.el.classList.contains(className)) {
                dom(this.dropBlock.el).removeClass(g => g.startsWith('shy-block-drag-over'));
                this.dropBlock.el.classList.add(className);
            }
        }
        if (this.dropBlock)
            this.kit.page.onDropEnterBlock(this.dragBlocks, this.dropBlock, this.dropDirection);
    }
    onDropEnd() {
        this.isDrag = false;
        this.isDown = false;
        if (this.dropBlock) {
            dom(this.dropBlock.el).removeClass(g => g.startsWith('shy-block-drag-over'));
        }
        this.dragBlocks = [];
        delete this.dropBlock;
        delete this.dropDirection;
    }
    async onDropBlock() {
        if (this.dragBlocks.length > 0 && this.dropBlock) {
            await this.kit.page.onBatchDragBlocks(this.dragBlocks, this.dropBlock, this.dropDirection);
        }
    }

    async onClickBlock(event: MouseEvent) {
        await this.kit.page.onOpenMenu(this.dragBlocks, event);
    }
    isDown: Boolean;
    isDrag: boolean = false;
}