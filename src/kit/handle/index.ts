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
    onShowBlockHandle(hoverBlock: Block) {
        this.handleBlock = hoverBlock.handleBlock;
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
            this.onDropOverBlock(hoverBlock.dropOverBlock, this.kit.mouse.moveEvent);
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
        var dir: DropDirection;
        if (willDropBlock) {
            var dr = this.kit.page.cacBlockDirection(willDropBlock, event);
            if (dr.direction != DropDirection.none) {
                dir = dr.direction;
                willDropBlock = dr.block;
            }
            else {
                willDropBlock = undefined;
            }
        }
        if (willDropBlock !== this.dropBlock && this.dropBlock) {
            dom(this.dropBlock.el).removeClass(g => g.startsWith('shy-block-drag-over'));
            this.kit.page.onDropLeaveBlock(this.dragBlocks, this.dropBlock, this.dropDirection);
        }
        if (willDropBlock) {
            this.dropDirection = dr.direction;
            this.dropBlock = dr.block;
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
}