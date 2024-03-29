import React from "react";
import { CollectTableSvg, PlusSvg } from "../../../../component/svgs";
import { Divider } from "../../../../component/view/grid";
import { Icon } from "../../../../component/view/icon";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { DataGridView } from "../base";
import { DataGridTool } from "../components/tool";
import { TableStoreListItem } from "./row";
import { CardConfig } from "../item/service";
import { S } from "../../../../i18n/view";

@url('/data-grid/list')
export class TableStoreList extends DataGridView {
    async createItem() {
        this.blocks.childs = [];
        for (let i = 0; i < this.data.length; i++) {
            var row = this.data[i];
            var rowBlock: TableStoreListItem = await BlockFactory.createBlock('/data-grid/list/row', this.page, { mark: i, dataId: row.id }, this) as TableStoreListItem;
            this.blocks.childs.push(rowBlock);
            await rowBlock.createElements();
        }
    }
    @prop()
    cardConfig: CardConfig = {
        auto: false,
        showCover: false,
        coverFieldId: "",
        coverAuto: false,
        showMode: 'default',
        showField: 'none',
        templateProps: {}
    }
    get isCardAuto() {
        return this.cardConfig?.auto || this.cardConfig.showMode == 'define'
    }
    getCardUrl() {
        if (this.cardConfig?.showMode == 'define') {
            return this.cardConfig.templateProps.url;
        }
    }
}

@view('/data-grid/list')
export class TableStoreListView extends BlockView<TableStoreList>{
    renderCreateTable() {
        if (this.block.isLoading) return <></>
        if (this.block.isLoadingData) return <></>
        return !this.block.schema && this.block.isCanEdit() && <div className="item-hover item-hover-focus padding-h-5 padding-w-10 cursor round flex" onClick={e => this.block.onCreateTableSchema()}>
            <span className="size-24 flex-center remark"><Icon size={16} icon={CollectTableSvg}></Icon></span>
            <span className="remark"><S>创建数据表格</S></span>
        </div>
    }
    renderView() {
        return <div className='sy-data-grid-list'
            onMouseEnter={e => this.block.onOver(true)}
            onMouseLeave={e => this.block.onOver(false)}
        ><DataGridTool block={this.block}></DataGridTool>
            {!this.block.noTitle && <Divider hidden={this.block.dataGridTab ? true : false}></Divider>}
            <ChildsArea childs={this.block.childs}></ChildsArea>
            {this.block.dataGridIsCanEdit() && !this.block.isCardAuto && <div
                onMouseDown={e => { e.stopPropagation(); this.block.onSyncAddRow({}, undefined, 'after') }}
                className="flex cursor item-hover round padding-5 f-14 remark">
                <Icon icon={PlusSvg}></Icon>
                <span><S>新增</S></span>
            </div>}
            {this.renderCreateTable()}
        </div>
    }
}