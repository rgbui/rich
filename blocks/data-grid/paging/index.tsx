import React from "react";
import { ChevronDownSvg, ChevronLeftSvg, ChevronRightSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Rect } from "../../../src/common/vector/point";
import { DataGridView } from "../view/base";
import { lst } from "../../../i18n/store";
import { S, Sp } from "../../../i18n/view";


@url('/data-grid/paging')
export class Paging extends Block {
    display = BlockDisplay.block;
    get refBlock(): DataGridView {
        return super.refBlock as DataGridView;
    }
    async onChangeIndex(index: number) {
        var totalPage = Math.ceil(this.refBlock.total / this.refBlock.size);
        if (index >= 1 && index <= totalPage) {
            if (typeof index == 'number') {
                await this.refBlock.onListPageIndex(index);
            }
        }
    }
    async onSyncReferenceBlock() {
        this.view.forceUpdate();
    }
}
@view('/data-grid/paging')
export class PagingView extends BlockView<Paging>{
    async onDropSize(event: React.MouseEvent) {
        var items: MenuItem[] = [
            { text: lst('选择每页的条数'), type: MenuItemType.text },
            { text: '20'+lst('条/页'), value: 20 },
            { text: '50'+lst('条/页'), value: 50 },
            { text: '80'+lst('条/页'), value: 80 },
            { text: '100'+lst('条/页'), value: 100 },
            { text: '150'+lst('条/页'), value: 150 },
            { text: '200'+lst('条/页'), value: 200 },
            { type: MenuItemType.divide },
            { text: '5'+lst('条/页'), value: 5 },
            { text: '10'+lst('条/页'), value: 10 },
        ];
        var r = await useSelectMenuItem({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, items);
        if (r) {
            await this.block.refBlock.onChangeSize(r.item.value);
        }
    }
    getPages() {
        if (this.block.refBlock) {
            var page = Math.ceil(this.block.refBlock.total / this.block.refBlock.size);
            var index: number = this.block.refBlock.pageIndex;
            if (index <= 0) index = 1;
            if (index > page) index = page;
            var ps: (string | number)[] = [];
            if (this.block.refBlock.total > 0) {
                if (index - 3 > 1) [1, "...", index - 2, index - 1, index].forEach((p) => ps.push(p));
                else for (var i = 1; i <= index; i++) ps.push(i);
                if (index + 3 < page) [index + 1, index + 2, "...", page].forEach((p) => ps.push(p));
                else for (var j = index + 1; j <= page; j++) ps.push(j);
            } else ps = [1];
            return ps.map((p) => {
                var classList: string[] = ["border", 'flex-center', "size-24", "round", "gap-w-5"];
                if (p == index) classList.push("bg-primary text-white");
                else if (typeof p == "number") {
                    classList.push('cursor')
                } else classList.push("remark");
                return {
                    text: p,
                    index: typeof p == "number" ? p : undefined,
                    classList,
                };
            });
        }
        return []
    }

    renderView()  {
        var totalPage = -1;
        if (this.block.refBlock) totalPage = Math.ceil(this.block.refBlock.total / this.block.refBlock.size);
        return <div style={this.block.visibleStyle}>
            <div style={this.block.contentStyle} className='flex min-h-24 f-14'>
                {this.block.refBlock && <>
                    <span className="text gap-r-10"><Sp text={'共{total}条'} data={{total:this.block.refBlock.total}}>共{this.block.refBlock.total}条</Sp></span>
                    <span onMouseDown={e => this.block.onChangeIndex(this.block.refBlock.pageIndex - 1)} className={"border flex-center size-24 round" + (this.block.refBlock.pageIndex == 1 ? " remark" : " cursor")}><Icon size={18} icon={ChevronLeftSvg}></Icon></span>
                    {this.getPages().map((pa, index) => {
                        return <span key={index} className={pa.classList.join(" ")} onMouseDown={e => this.block.onChangeIndex(pa.index)}>{pa.text}</span>
                    })}
                    <span onMouseDown={e => this.block.onChangeIndex(this.block.refBlock.pageIndex + 1)} className={"border flex-center  size-24 round" + (this.block.refBlock.pageIndex == totalPage ? " remark" : " cursor")}><Icon size={18} icon={ChevronRightSvg}></Icon></span>
                    <span onMouseDown={e => this.onDropSize(e)} className="gap-l-10 border h-24 padding-w-10 round flex-center">{this.block.refBlock.size}<S>条/页</S><Icon size={16} icon={ChevronDownSvg}></Icon></span>
                </>}
                {!this.block.refBlock && <div></div>}
            </div></div>
    }
}