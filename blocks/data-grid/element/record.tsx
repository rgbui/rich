import React from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ViewField } from "../schema/view";
import { CardConfig } from "../view/item/service";

/***
 * 每一条记录，显示 item ,row,card
 * 
 */
@url('/data-grid/record')
export class DataGridItemRecord extends Block {
    @prop()
    dataId: string;
    @prop()
    schemaId: string;
    @prop()
    fields: ViewField[] = [];
    @prop()
    cardConfig: CardConfig = {
        auto: false,
        showCover: false,
        coverFieldId: "",
        coverAuto: false,
        showTemplate: false,
        templateProps: {}
    };
    async get() {
        return await super.get(undefined, { emptyChilds: true })
    }
}
@view('/data-grid/record')
export class DataGridItemRecordView extends BlockView<DataGridItemRecord>{
    render() {
        // if (this.block.dataGrid.url == BlockUrlConstant.DataGridGallery) return this.renderCards()
        // else return this.renderItems();
        return <div></div>
    }
}