
import React from "react";
import { Block } from "../../../../src/block";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { CardFactory } from "../../template/card/factory/factory";
import { DataGridView } from "../base";
import { DataGridTool } from "../components/tool";
import { CardConfig } from "../item/service";
import "./style.less";
import { CollectTableSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";

@url('/data-grid/gallery')
export class TableStoreGallery extends DataGridView {
    @prop()
    gallerySize: number = 3;
    @prop()
    cardConfig: CardConfig = {
        auto: false,
        showCover: false,
        coverFieldId: "",
        coverAuto: false,
        showMode: 'default',
        templateProps: {}
    };
    get isCardAuto() {
        return this.cardConfig?.auto || this.cardConfig.showMode == 'define'
    }
}

@view('/data-grid/gallery')
export class TableStoreGalleryView extends BlockView<TableStoreGallery>{
    renderRows() {
        var childs = this.block.childs;
        var eles: JSX.Element[] = [];
        var size = this.block.gallerySize || 3;
        if (typeof size != 'number') size = 3;
        var w = (100 / size).toFixed(2);
        var gap = 20;
        if (this.block.isCardAuto) {
            var rss = [];
            for (let j = 0; j < size; j++) {
                rss.push([]);
            }
            for (let i = 0; i < childs.length; i++) {
                var c = i % size;
                rss[c].push(childs[i]);
            }
            eles = rss.map((rs, i) => {
                return <div className='sy-data-grid-gallery-column' style={{ width: `calc(${w}% - ${gap}px)`, marginRight: gap, marginBottom: gap }} key={i}>
                    {rs.map(c => <div className="sy-data-grid-gallery-cell w100" key={c.id}>{this.renderItem(c)}</div>)}
                </div>
            })
        }
        else {
            for (let i = 0; i < childs.length; i++) {
                var cs: Block[] = [];
                for (let j = 0; j < size; j++) {
                    if (i + j < childs.length) {
                        cs.push(childs[i + j])
                    }
                }
                i += (size - 1);
                eles.push(<div className='sy-data-grid-gallery-row' key={i}>
                    {cs.map(c => <div className="sy-data-grid-gallery-cell" style={{ width: `calc(${w}% - ${gap}px)`, marginRight: gap, marginBottom: gap }}
                        key={c.id}>{this.renderItem(c)}
                    </div>)}
                </div>)
            }
        }
        return eles;
    }
    renderItem(itemBlock: Block) {
        if (this.block.cardConfig.showMode == 'define' && this.block.cardConfig.templateProps.url) {
            var CV = CardFactory.getCardView(this.block.cardConfig.templateProps.url);
            if (CV) return <CV item={itemBlock as any} dataGrid={this.block}></CV>
        }
        return <itemBlock.viewComponent block={itemBlock}></itemBlock.viewComponent>
    }
    renderCreateTable() {
        return !this.block.schema && this.block.isCanEdit() && <div className="item-hover item-hover-focus cursor round flex" onClick={e => this.block.onCreateTableSchema()}>
            <span className="size-24 flex-center remark"><Icon size={16} icon={CollectTableSvg}></Icon></span>
            <span className="remark">创建数据表格</span>
        </div>
    }
    render() {
        return <div className='sy-data-grid-gallery'
            onMouseEnter={e => this.block.onOver(true)}
            onMouseLeave={e => this.block.onOver(false)}>
            <DataGridTool block={this.block}></DataGridTool>
            <div className={"sy-data-grid-gallery-list" + (this.block.isCardAuto ? " sy-data-grid-gallery-list-cols" : "")}>{this.renderRows()} </div>
            {this.renderCreateTable()}
        </div>
    }
}