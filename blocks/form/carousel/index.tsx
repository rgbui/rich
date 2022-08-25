import React from "react";
import { ArrowLeftSvg, ArrowRightSvg, PlusSvg, TrashSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItemType } from "../../../component/view/menu/declare";
import { Block } from "../../../src/block";
import { BlockUrlConstant } from "../../../src/block/constant";
import { BlockFactory } from "../../../src/block/factory/block.factory";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";
import { Rect } from "../../../src/common/vector/point";
import { ActionDirective } from "../../../src/history/declare";
import "./style.less";

@url('/carousel')
export class Carousel extends Block {
    carouselIndex: number = 0;
    async didMounted(): Promise<void> {
        if (this.childs.length == 0) {
            await this.createInitTabItems();
            this.forceUpdate()
        }
    }
    async createInitTabItems() {
        this.blocks.childs = [];
        this.blocks.childs.push(await BlockFactory.createBlock('/carousel/content',
            this.page,
            {
                blocks: {
                    childs: [{
                        url: BlockUrlConstant.TextSpan,
                        content: 'Content of Tab Pane 1'
                    }]
                }
            }, this));
    }
    async onAddTabItem() {
        this.page.onAction(ActionDirective.onCarouselAddItem, async () => {
            await this.appendBlock({ url: '/carousel/content', blocks: { childs: [{ url: BlockUrlConstant.TextSpan, content: '内容' }] } }, this.blocks.childs.length, 'childs');
        })
    }
    async onTabeItemContextmenu(event: React.MouseEvent, at: number) {
        var um = await useSelectMenuItem(
            { roundArea: Rect.fromEvent(event) },
            [
                { name: 'prev', text: '前移', disabled: at == 0 ? true : false, icon: ArrowLeftSvg },
                { name: 'after', text: '后移', disabled: at == this.childs.length - 1 ? true : false, icon: ArrowRightSvg },
                { type: MenuItemType.divide },
                { name: 'delete', text: '删除', disabled: this.childs.length == 1 ? true : false, icon: TrashSvg },
            ]
        );
        if (um) {
            if (um.item.name == 'delete') {
                this.page.onAction(ActionDirective.onCarouselRemoveItem, async () => {
                    await this.blocks.childs[at].delete();
                })
            }
        }
    }
    changeTabIndex(tabeIndex) {
        this.carouselIndex = tabeIndex;
        this.forceUpdate()
    }
}
@view('/carousel')
export class CarouselView extends BlockView<Carousel>{
    render() {
        return <div className='sy-block-carousel'
            style={this.block.visibleStyle}>
            <div className="sy-block-carousel-indicators" onMouseDown={e => e.stopPropagation()}>
                {this.block.blocks.childs.map((c, index) => {
                    return <div onContextMenu={e => this.block.onTabeItemContextmenu(e, index)} onClick={e => this.block.changeTabIndex(index)} key={c.id} className={"sy-block-carousel-indicator" + (this.block.carouselIndex == index ? " hover" : "")}></div>
                })}
                <div className="sy-block-carousel-indicator-plus" onClick={e => this.block.onAddTabItem()}>
                    <Icon icon={PlusSvg} size={14}></Icon>
                </div>
            </div>
            <div className="sy-block-carousel-contents" style={this.block.contentStyle}>
                <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
            </div>
        </div>
    }
}