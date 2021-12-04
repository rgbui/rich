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
        this.handleBlock = block
        if (this.view.isDown) {
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
        if (this.view.isDown) {
            this.onDropOverBlock(this.handleBlock, this.kit.mouse.moveEvent);
        }
    }
    onCloseBlockHandle() {
        var handleEl = this.view.handleEle;
        handleEl.style.display = 'none';
        if (!this.view.isDown) delete this.handleBlock;
    }
    containsEl(el: HTMLElement) {
        return this.view.handleEle.contains(el);
    }
    dragBlocks: Block[] = [];
    dropBlock: Block;
    dropDirection: DropDirection;
    onDropOverBlock(willDropBlock: Block, event: MouseEvent) {
        if (willDropBlock?.isLine) willDropBlock = willDropBlock.closest(x => x.isBlock);
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
        if (willDropBlock !== this.dropBlock && this.dropBlock) {
            dom(this.dropBlock.el).removeClass(g => g.startsWith('shy-block-drag-over'));
            this.kit.page.onDropLeaveBlock(this.dragBlocks, this.dropBlock, this.dropDirection);
        }
        if (willDropBlock) {
            var dr = this.kit.page.cacBlockDirection(willDropBlock, event);
            if (dr.direction != DropDirection.none) {
                this.dropDirection = dr.direction;
                this.dropBlock = dr.block;
                var direction = DropDirection[this.dropDirection];
                var className = 'shy-block-drag-over-' + direction;
                if (!this.dropBlock.el.classList.contains(className)) {
                    dom(this.dropBlock.el).removeClass(g => g.startsWith('shy-block-drag-over'));
                    this.dropBlock.el.classList.add(className);
                }
            }
            else {
                this.dropDirection = DropDirection.none;
                delete this.dropBlock;
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
            dom(this.dropBlock.el).removeClass(g => g.startsWith('shy-block-drag-over'));
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