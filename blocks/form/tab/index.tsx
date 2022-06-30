import React from "react";
import { ArrowLeftSvg, ArrowRightSvg, PlusSvg, TrashSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItemTypeValue } from "../../../component/view/menu/declare";
import { Block } from "../../../src/block";
import { BlockUrlConstant } from "../../../src/block/constant";
import { BlockFactory } from "../../../src/block/factory/block.factory";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";
import { MouseDragger } from "../../../src/common/dragger";
import { Rect } from "../../../src/common/vector/point";
import { ActionDirective } from "../../../src/history/declare";
import "./style.less";

@url('/tab')
export class Tab extends Block {
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    tabIndex: number = 0;
    get allBlockKeys(): string[] {
        return ['childs', 'subChilds']
    }
    @prop()
    showIcon: boolean = false;
    @prop()
    contentHeight: number = 200;
    async didMounted(): Promise<void> {
        if(this.childs.length == 0) {
            await this.createInitTabItems();
            this.forceUpdate()
        }
    }
    async createInitTabItems() {
        this.blocks.childs = [];
        this.blocks.subChilds = [];

        this.blocks.childs.push(await BlockFactory.createBlock('/tab/item', this.page, { content: '标签1' }, this));
        this.blocks.subChilds.push(await BlockFactory.createBlock('/tab/page', this.page, { blocks: { childs: [{ url: BlockUrlConstant.TextSpan, content: '' }] } }, this));

        this.blocks.childs.push(await BlockFactory.createBlock('/tab/item', this.page, { content: '标签2' }, this));
        this.blocks.subChilds.push(await BlockFactory.createBlock('/tab/page', this.page, { blocks: { childs: [{ url: BlockUrlConstant.TextSpan, content: '' }] } }, this));

        this.blocks.childs.push(await BlockFactory.createBlock('/tab/item', this.page, { content: '标签3' }, this));
        this.blocks.subChilds.push(await BlockFactory.createBlock('/tab/page', this.page, { blocks: { childs: [{ url: BlockUrlConstant.TextSpan, content: '' }] } }, this));

    }
    async onAddTabItem() {
        this.onAction(ActionDirective.onTabAddItem, async () => {
            await this.appendBlock({ url: '/tab/item', content: '标签' }, this.blocks.childs.length, 'childs');
            await this.appendBlock({ url: '/tab/page', blocks: { childs: [{ url: BlockUrlConstant.TextSpan, content: '' }] } }, this.blocks.subChilds.length, 'subChilds');
        })
    }
    changeTabIndex(tabeIndex) {
        this.tabIndex = tabeIndex;
        this.forceUpdate()
    }
    async onTabeItemContextmenu(event: React.MouseEvent, at: number) {
        event.preventDefault();
        event.stopPropagation();
        var um = await useSelectMenuItem(
            { roundArea: Rect.fromEvent(event) },
            [
                { name: 'prev', text: '前移', disabled: at == 0 ? true : false, icon: ArrowLeftSvg },
                { name: 'after', text: '后移', disabled: at == this.childs.length - 1 ? true : false, icon: ArrowRightSvg },
                { type: MenuItemTypeValue.divide },
                { name: 'delete', text: '删除', disabled: this.childs.length == 1 ? true : false, icon: TrashSvg },
            ]
        );
        if (um) {
            if (um.item.name == 'delete') {
                this.onAction(ActionDirective.onTabRemoveItem, async () => {
                    await this.blocks.childs[at].delete();
                    await this.blocks.subChilds[at].delete();
                })
            }
            else if (um.item.name == 'after') {
                this.onAction(ActionDirective.onTabExchangeItem, async () => {
                    this.tabIndex = at + 1;
                    this.blocks.childs[at].insertAfter(this.blocks.childs[at + 1], 'childs');
                    this.blocks.subChilds[at].insertAfter(this.blocks.subChilds[at + 1], 'subChilds');
                })
            }
            else if (um.item.name == 'prev') {
                this.onAction(ActionDirective.onTabExchangeItem, async () => {
                    this.tabIndex = at - 1;
                    this.blocks.childs[at].insertBefore(this.blocks.childs[at - 1], 'childs');
                    this.blocks.subChilds[at].insertBefore(this.blocks.subChilds[at - 1], 'subChilds');
                })
            }
        }
    }
    async onDraggerItem(event: React.MouseEvent, at: number) {
        // if (this.page.keyboardPlate.isAlt()) {
        //     event.stopPropagation();
        // }
        // else return;
        // var ele = event.target as HTMLElement;
        // var parent = ele.parentElement;
        // var self = this;
        // MouseDragger({
        //     event,
        //     moveStart() {
        //         ghostView.load(ele, { point: Point.from(event) });
        //         ele.classList.add('dragging')
        //         ele.style.pointerEvents = 'none';
        //     },
        //     move(ev) {
        //         ghostView.move(Point.from(ev));
        //         var el = ev.target as HTMLElement;
        //         var overTh = el.closest('.sy-block-tab-item') as HTMLElement;
        //         if (overTh && parent.contains(overTh) && !overTh.classList.contains('sy-block-tab-plus')) {
        //             var rect = Rect.fromEle(overTh);
        //             if (ev.pageX < rect.center) {
        //                 parent.insertBefore(ele, overTh);
        //             }
        //             else {
        //                 var next = overTh.nextElementSibling;
        //                 if (next) parent.insertBefore(ele, next)
        //                 else parent.appendChild(ele)
        //             }
        //         }
        //     },
        //     moveEnd() {
        //         ghostView.unload();
        //         ele.classList.remove('dragging')
        //         ele.style.pointerEvents = 'auto';
        //         var cs = Array.from(parent.querySelectorAll('.sy-dg-table-head-th'));
        //         var b = ele.previousElementSibling;
        //         var currentAt = -1;
        //         if (b) currentAt = cs.findIndex(g => g === b);
        //         if (at !== currentAt) {
        //             self.tabIndex = currentAt;
        //             self.onAction(ActionDirective.onTabExchangeItem, async () => {
        //                 var block = self.blocks.childs[at];
        //                 self.append(block, currentAt, 'childs');
        //                 var sb = self.blocks.subChilds[at];
        //                 self.append(sb, currentAt, 'childs');
        //             })
        //         }
        //     }
        // })
    }
}
@view('/tab')
export class TabView extends BlockView<Tab>{
    onResize(event: React.MouseEvent) {
        event.stopPropagation();
        var height = this.block.contentHeight;
        MouseDragger({
            event,
            moving: (e, d, end) => {
                var dy = e.clientY - event.clientY;
                var h = height + dy;
                this.block.contentHeight = h;
                if (end) {
                    this.block.onManualUpdateProps(
                        { contentHeight: height },
                        { contentHeight: h }
                    );
                }
                else this.forceUpdate()
            }
        })
    }
    render() {
        return <div className='sy-block-tab'
            style={this.block.visibleStyle}>
            <div className="sy-block-tab-items">
                <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
                <div className="sy-block-tab-plus" onMouseDown={e => this.block.onAddTabItem()}><Icon size={14} icon={PlusSvg}></Icon></div>
            </div>
            <div className="sy-block-tab-pages" style={{ height: this.block.contentHeight }}>
                <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
            </div>
            <div className="sy-block-tab-resize" onMouseDown={e => this.onResize(e)}></div>
        </div>
    }
}


