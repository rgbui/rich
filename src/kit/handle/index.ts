import { Kit } from "..";
import { Block } from "../../block";
import { dom } from "../../common/dom";
import { Point } from "../../common/point";
import { Events } from "../../../util/events";
import { DropDirection } from "./direction";
import { HandleView } from "./view";

export class Handle extends Events {
    kit: Kit;
    view: HandleView;
    constructor(kit: Kit) {
        super();
        this.kit = kit;
    }
    handleBlock: Block;
    onShowBlockHandle(block: Block) {
        var visbileBlock = block.visibleContentBlock;
        if (!visbileBlock) {
            console.log('not found visibleContentBlock', block);
        }
        this.handleBlock = visbileBlock;
        if (this.view.isDown) {
            var handleEl = this.view.handleEle;
            handleEl.style.display = 'none';
        }
        else if (visbileBlock) {
            var bound = visbileBlock.getVisibleContentBound();
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
        if (this.view.isDown) {
            this.onDropOverBlock(this.handleBlock, this.kit.mouse.moveEvent);
        }
    }
    onCloseBlockHanlde() {
        var handleEl = this.view.handleEle;
        handleEl.style.display = 'none';
        if (!this.view.isDown)
            delete this.handleBlock;
    }
    containsEl(el: HTMLElement) {
        return this.view.handleEle.contains(el);
    }
    dragBlocks: Block[] = [];
    dropBlock: Block;
    dropDirection: DropDirection;
    onDropOverBlock(block: Block, event: MouseEvent) {
        var willDropBlock: Block = block;
        if (willDropBlock !== this.dropBlock && this.dropBlock) {
            dom(this.dropBlock.el).removeClass(g => g.startsWith('sy-block-drag-over'));
            this.kit.page.onDropLeaveBlock(this.dragBlocks, this.dropBlock, this.dropDirection);
        }
        this.dropBlock = willDropBlock;
        if (willDropBlock) {
            this.dropDirection = this.kit.page.cacBlockDirectionByMouse(willDropBlock, event);
            var direction = DropDirection[this.dropDirection];
            var className = 'sy-block-drag-over-' + direction;
            if (!this.dropBlock.el.classList.contains(className)) {
                dom(this.dropBlock.el).removeClass(g => g.startsWith('sy-block-drag-over'));
                this.dropBlock.el.classList.add(className);
            }
        }
        else {
            this.dropDirection = DropDirection.none;
            delete this.dropBlock;
        }
        if (this.dropBlock)
            this.kit.page.onDropEnterBlock(this.dragBlocks, this.dropBlock, this.dropDirection);
    }
    onDropEnd() {
        if (this.dropBlock) {
            dom(this.dropBlock.el).removeClass(g => g.startsWith('sy-block-drag-over'));
        }
        delete this.dragBlocks;
        delete this.dropBlock;
        delete this.dropDirection;
    }
    onDropBlock() {
        if (this.dragBlocks.length > 0 && this.dropBlock) {
            this.kit.page.onBatchDragBlocks(this.dragBlocks, this.dropBlock, this.dropDirection);
        }
    }
    onClickBlock(event: MouseEvent) {
        this.kit.page.onOpenMenu(this.dragBlocks, event);
    }
}