import React from "react";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { DataGridView } from "../../view/base";
import { DataStoreViewFactory } from "./factory";

/***
 * 数据总共分三部分
 * 1. 数据源（调用第三方接口获取数据），编辑的数据源需要触发保存
 * 2. 表格的元数据信息（来源于全局的表格元数据信息)
 * 3. 表格的视图展示（具体到视图的展现,信息存在tableStore） 
 * 
 */
@url('/data-grid/table/custom')
export class TableStoreCustom extends DataGridView {
    @prop()
    dataViewUrl: string = '';
}
@view('/data-grid/table/custom')
export class TableStoreCustomView extends BlockView<TableStoreCustom>{
    renderView()  {
        var ViewC = DataStoreViewFactory.getDataStoreView(this.block.dataViewUrl);
        return <div>
            <ViewC block={this.block}></ViewC>
        </div>
    }
}