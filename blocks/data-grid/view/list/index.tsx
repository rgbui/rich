import React from "react";
import { PlusSvg } from "../../../../component/svgs";
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
import { DataGridGroup } from "../components/group";
import { Spin, SpinBox } from "../../../../component/view/spin";

@url('/data-grid/list')
export class TableStoreList extends DataGridView {
    async createItem(isForce?: boolean) {
        this.blocks.childs = [];
        var ds = this.data.filter(g => g.parentId ? false : true)
        for (let i = 0; i < ds.length; i++) {
            var row = ds[i];
            var rowBlock: TableStoreListItem = await BlockFactory.createBlock('/data-grid/list/row', this.page, { mark: i, dataId: row.id }, this) as TableStoreListItem;
            this.blocks.childs.push(rowBlock);
            await rowBlock.createElements();
        }
        if (isForce) {
            this.forceManualUpdate()
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
        return this.cardConfig?.auto || this.cardConfig?.showMode == 'define'
    }
    getCardUrl() {
        if (this.cardConfig?.showMode == 'define') {
            return this.cardConfig.templateProps.url;
        }
    }
}

@view('/data-grid/list')
export class TableStoreListView extends BlockView<TableStoreList> {
    renderCreateTable() {
        if (this.block.isLoading) return <Spin block></Spin>
        return !this.block.schema && this.block.isCanEdit() && <div className="item-hover item-hover-focus padding-5 cursor round flex" onClick={e => this.block.onCreateTableSchema()}>
            <span className="size-24 flex-center remark"><Icon size={16} icon={{ name: 'byte', code: 'table' }}></Icon></span>
            <span className="remark"><S>添加或创建数据表</S></span>
        </div>
    }
    renderView() {
        return <div style={this.block.visibleStyle}>
            <div style={this.block.contentStyle}>
                <div className='sy-data-grid-list'
                    onMouseMove={e => this.block.onOver(true)}
                    onMouseEnter={e => this.block.onOver(true)}
                    onMouseLeave={e => this.block.onOver(false)}
                ><DataGridTool block={this.block}></DataGridTool>
                    {!this.block.noTitle && <Divider hidden={this.block.dataGridTab ? true : false}></Divider>}
                    {this.renderCreateTable()}
                    <SpinBox spin={this.block.isLoadingData}>
                        <DataGridGroup block={this.block} renderRowContent={(b, cs, g) => {
                            return <div>
                                <ChildsArea childs={cs}></ChildsArea>
                                {this.block.dataGridIsCanEdit() && !this.block.isCardAuto && <div
                                    onMouseDown={e => {
                                        e.stopPropagation();
                                        var id = cs.last()?.id;
                                        this.block.onSyncAddRow({}, id, 'after')
                                    }}
                                    className="flex cursor item-hover round padding-5 f-14 remark">
                                    <Icon size={18} icon={PlusSvg}></Icon>
                                    <span><S>新增</S></span>
                                </div>}
                            </div>
                        }}></DataGridGroup>
                    </SpinBox>
                </div></div>
            {this.renderComment()}
        </div>

    }
}