
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
import { isMobileOnly } from "react-device-detect";
import { S } from "../../../../i18n/view";
import { Spin } from "../../../../component/view/spin";

@url('/data-grid/gallery')
export class TableStoreGallery extends DataGridView {
    @prop()
    gallerySize: number = 3;
    @prop()
    cardConfig: CardConfig = {
        auto: false,
        showCover: false,
        coverFieldId: "",
        showField: 'none',
        coverAuto: false,
        showMode: 'default',
        templateProps: {}
    };
    getCardUrl() {
        if (this.cardConfig?.showMode == 'define') {
            return this.cardConfig.templateProps.url;
        }
    }
    get isCardAuto() {
        return this.cardConfig?.auto || this.cardConfig.showMode == 'define'
    }
}

@view('/data-grid/gallery')
export class TableStoreGalleryView extends BlockView<TableStoreGallery> {
    renderRows() {
        var childs = this.block.childs;
        var eles: JSX.Element[] = [];
        var size = this.block.gallerySize || 3;
        if (typeof size != 'number') size = 3;
        var gap = 20;
        if (isMobileOnly) { size = 2; gap = 8; }
        // var w = (100 / size).toFixed(2);
        var wd = `calc((100% - ${(size-1)*gap}px ) / ${size})`
        // n*w + (n-1)*gap = 100%
        //w=(100%-(n-1)* gap)/n

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
                return <div className='sy-data-grid-gallery-column' style={{ width: wd, marginRight:i==rss.length-1?undefined: gap, marginBottom: undefined }} key={i}>
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
                    {cs.map((c,j)=> <div className="sy-data-grid-gallery-cell" style={{ width:wd, marginRight:cs.length-1==j?undefined: gap, marginBottom: undefined }}
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
        if (this.block.isLoading) return <></>
        if (this.block.isLoadingData) return <></>
        return !this.block.schema && this.block.isCanEdit() && <div className="item-hover item-hover-focus padding-h-5 padding-w-10 cursor round flex" onClick={e => this.block.onCreateTableSchema()}>
            {this.block.willCreateSchema && <Spin></Spin>}
            <span className="size-24 flex-center remark"><Icon size={16} icon={{ name: 'byte', code: 'table' }}></Icon></span>
            <span className="remark"><S>创建数据表格</S></span>
        </div>
    }
    renderView() {
        return <div className='sy-data-grid-gallery'
            onMouseEnter={e => this.block.onOver(true)}
            onMouseLeave={e => this.block.onOver(false)}>
            <DataGridTool block={this.block}></DataGridTool>
            <div className={"sy-data-grid-gallery-list" + (this.block.isCardAuto ? " sy-data-grid-gallery-list-cols" : "")}>{this.renderRows()} </div>
            {this.renderCreateTable()}
        </div>
    }
}