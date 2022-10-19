import React from "react";
import { MenuItem } from "../../../../component/view/menu/declare";
import { Block } from "../../../../src/block";
import { BlockDirective } from "../../../../src/block/enum";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { util } from "../../../../util/util";
import { ViewField } from "../../schema/view";
import { DataGridView } from "../base";
import { createFieldBlock } from "./service";
import trash from "../../../../src/assert/svg/trash.svg";
import "./style.less";
import { langProvider } from "../../../../i18n/provider";
import { LangID } from "../../../../i18n/declare";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { TableStoreGallery } from "../gallery";
import { autoImageUrl } from "../../../../net/element.type";
import { DropDirection } from "../../../../src/kit/handle/direction";

@url('/data-grid/item')
export class TableStoreItem extends Block {
    dataRow: Record<string, any> = {};
    dataIndex: number;
    get schema() {
        return (this.parent as DataGridView).schema;
    }
    get fields() {
        return (this.parent as DataGridView).fields;
    }
    get dataGrid() {
        if (this.parent instanceof DataGridView) {
            return this.parent;
        }
    }
    async createElements() {
        this.blocks.childs = [];
        for (let i = 0; i < this.fields.length; i++) {
            var field = this.fields[i];
            if (field) {
                var block = await createFieldBlock(field, { row: this.dataRow, index: this.dataIndex }, this);
                if (block) this.blocks.childs.push(block);
            }
            else {
                console.log(this, this.fields);
            }
        }
    }
    async onUpdateCellValue(viewField: ViewField, value: any) {
        value = util.clone(value);
        this.dataRow[viewField.field.name] = value;
        var dr = this.dataGrid.data.find(g => g.id == this.dataRow.id);
        dr[viewField.field.name] = value;
        await this.schema.rowUpdate({
            dataId: this.dataRow.id,
            data: { [viewField.field.name]: value }
        })
    }
    async onUpdateFieldSchema(viewField: ViewField, data) {
        data = util.clone(data);
        viewField.field.update(data);
        await this.schema.fieldUpdate({ fieldId: viewField.field.id, data })
    }
    async onGetContextMenus(): Promise<MenuItem<string | BlockDirective>[]> {
        var items: MenuItem<BlockDirective>[] = [];
        items.push({
            name: BlockDirective.delete,
            icon: trash,
            text: langProvider.getText(LangID.menuDelete),
            label: "delete"
        });
        return items;
    }
    async onClickContextMenu(item: MenuItem<BlockDirective | string>, event: MouseEvent) {
        switch (item.name) {
            case BlockDirective.delete:
                this.dataGrid.onRemoveItem(this.dataRow.id);
                break;
        }
    }
    async onHandlePlus() {
        await this.dataGrid.onAddRow({}, this.dataRow.id, 'after');
    }
    get isCanDrop(): boolean {
        return true;
    }
    isAllowDrops(dragBlocks: Block[]) {
        if (dragBlocks.length == 1) {
            var dg = dragBlocks[0];
            if (dg instanceof TableStoreItem && dg.dataGrid === this.dataGrid) {
                if (dg === this) return false;
                return true;
            }
        }
        return false;
    }
    canDropDirections() {
        return [
            DropDirection.top,
            DropDirection.bottom
        ]
    }
    async drop(blocks: Block[], direction: DropDirection) {
        var dragRow = blocks[0] as TableStoreItem;
        switch (direction) {
            case DropDirection.bottom:
            case DropDirection.top:
                var result = await this.schema.rowRank({
                    id: dragRow.dataRow.id,
                    pos: {
                        id: this.dataRow.id,
                        pos: DropDirection.bottom == direction ? "after" : 'before'
                    }
                });
                if (result.ok) {
                    if (result.data?.isCacSort)
                        this.page.addUpdateEvent(async () => {
                            this.dataGrid.onReloadData()
                        })
                    else {
                        dragRow.dataRow.sort = result.data.sort;
                        this.page.addUpdateEvent(async () => {
                            this.dataGrid.onSortRank()
                        })
                    }
                }
                break;
        }
    }
}
@view('/data-grid/item')
export class TableStoreItemView extends BlockView<TableStoreItem>{
    renderItems() {
        return <div className='sy-data-grid-item'><ChildsArea childs={this.block.childs}></ChildsArea> </div>
    }
    renderCards() {
        var ga = this.block.dataGrid as TableStoreGallery;
        if (ga.cardConfig.showCover) {
            var field = this.block.schema.fields.find(g => g.id == ga.cardConfig.coverFieldId);
            var imageData;
            if (field) imageData = this.block.dataRow[field.name];
            if (Array.isArray(imageData)) imageData = imageData[0];
            return <div className='sy-data-grid-item sy-data-grid-card'>
                <div className="sy-data-grid-card-cover">
                    {imageData && <img style={{ maxHeight: ga.cardConfig.coverAuto ? "auto" : 200 }} src={autoImageUrl(imageData.url, 500)} />}
                </div>
                <div className="sy-data-grid-card-items">
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
            </div>
        }
        else {
            return <div className='sy-data-grid-item'><ChildsArea childs={this.block.childs}></ChildsArea> </div>
        }
    }
    render() {
        if (this.block.dataGrid.url == BlockUrlConstant.DataGridGallery) return this.renderCards()
        else return this.renderItems();
    }
}


