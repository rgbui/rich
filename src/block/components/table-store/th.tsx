import { Block } from "../../base";
import { BaseComponent } from "../../base/component";
import { BlockAppear, BlockDisplay } from "../../base/enum";
import { prop, url, view } from "../../factory/observable";
import React from "react";
import { TextArea } from "../../base/appear";
import { TableStore } from "./table";
import { TextEle } from "../../../common/text.ele";
import { TableStoreHead } from "./head";
@url('/tablestore/th')
export class TableStoreTh extends Block {
    appear = BlockAppear.text;
    display = BlockDisplay.block;
    name: string;
    partName='th';
    get col() {
        return this.tableStore.cols.find(g => g.name == this.name);
    }
    get metaCol() {
        return this.tableStore.meta.cols.find(g => g.name == this.name);
    }
    get tableStore(): TableStore {
        return (this.parent as TableStoreHead).tableStore;
    }
    get htmlContent() {
        return  TextEle.getTextHtml(this.metaCol.text) 
    }
    get isCol(){
        return true;
    }
}
@view('/tablestore/th')
export class TableStoreThView extends BaseComponent<TableStoreTh>{
    render() {
        return <div className='sy-tablestore-head-th' style={{ width: this.block.col.width + '%' }}>
            <TextArea html={this.block.htmlContent}></TextArea>
        </div>
    }
}