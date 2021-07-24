import { Kit } from "..";
import { Block } from "../../block";
import { dom } from "../../common/dom";
import { Point } from "../../common/point";
import { Events } from "../../../util/events";
import { DropDirection } from "./direction";
import { BarView } from "./view";


export class Bar extends Events {
    kit: Kit;
    view: BarView;
    constructor(kit: Kit) {
        super();
        this.kit = kit;
    }
    get barEle() {
        return this.view.barEle;
    }
    /**
     * 这个block是鼠标悬停时，所在的block
     * 只是为了更好的呈现bar的位置，并不代表将要操作的就是这个block，
     * 具体的操作block取决于选区
     * 
     */
    hoverBlock: Block;
    /**
     * 当前悬停的block，
     * 该block与hoverBlock并非是一对一
     */
    get visibleHoverBlock() {
        if (this.hoverBlock.isLine) {
            return this.hoverBlock.closest(x => !x.isLine);
        }
        return this.hoverBlock;
    }
    onHoverBlock(block: Block, event: MouseEvent) {
        if (this.view.isDrag) {
            this.onDropOverBlock(block, event);
        }
        if (this.hoverBlock != block) {
            if (this.hoverBlock) {
                this.kit.page.emit('hoverOutBlock', this.hoverBlock);
            }
        }
        this.hoverBlock = block;
        if (this.hoverBlock) {
            var bound = this.visibleHoverBlock.getVisibleContentBound();
            var pos = Point.from(bound);
            this.barEle.style.top = pos.y + 'px';
            this.barEle.style.left = pos.x + 'px';
            this.barEle.style.display = 'flex';
        }
        else this.barEle.style.display = 'none';
        if (this.hoverBlock) {
            this.kit.page.emit('hoverBlock', this.hoverBlock);
        }
    }
    dragBlocks: Block[] = [];
    dropBlock: Block;
    dropDirection: DropDirection;
    onDropOverBlock(block: Block, event: MouseEvent) {
        var willDropBlock: Block;
        if (block)
            willDropBlock = block.closest(x => !x.isLine);
        if (willDropBlock !== this.dropBlock) {
            if (this.dropBlock) {
                dom(this.dropBlock.el).removeClass(g => g.startsWith('sy-block-drag-over'));
                this.kit.page.emit('dropOutBlock', this.dropBlock);
            }
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
        }
        this.kit.page.emit('dropOverBlock', this.dropBlock, this.dropDirection);
    }
    onDropEnd() {
        if (this.dropBlock) {
            dom(this.dropBlock.el).removeClass(g => g.startsWith('sy-block-drag-over'));
        }
    }
}