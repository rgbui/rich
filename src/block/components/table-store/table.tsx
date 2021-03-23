import { Block } from "../../base";
import { BaseComponent } from "../../base/component";
import React from 'react';
import { TableMeta } from "./view.meta";
import { util } from "../../../util/util";
import "./style.less";
import { url, view } from "../../factory/observable";
/***
 * 数据总共分三部分
 * 1. 数据源（调用第三方接口获取数据），编辑的数据源需要触发保存
 * 2. 表格的元数据信息（来源于全局的表格元数据信息)
 * 3. 表格的视图展示（具体到视图的展现,信息存在tableStore） 
 */
@url('/table/store')
export class TableStore extends Block {
    meta: TableMeta;
    cols: {
        name: string,
        width: number
    }[] = [];
    data: any[] = [];
    pagination: boolean;
    async load(data) {
        for (var n in data) {
            if (n == 'meta') {
                this.meta = new TableMeta(data[n]);
            }
            else {
                this[n] = data[n];
            }
        }
    }
    async get() {
        var json: Record<string, any> = {
            cols: util.clone(this.cols),
            meta: this.meta.get(),
            data: util.clone(this.data),
            pagination: this.pagination
        };
        return json;
    }
}
@view('/table/store')
export class TableStoreView extends BaseComponent<TableStore>{
    renderHead() {
        return <div className='sy-table-store-head'>{
            this.block.cols.map(col => {
                var me = this.block.meta.cols.find(g => g.name == col.name);
                var colStyle: Record<string, any> = {
                    width: col.width + '%'
                }
                return <div style={colStyle} className='sy-table-store-head-cell' key={col.name}>{me.text}</div>
            })
        }</div>
        
        
    }
    renderBody() {
        return <div className='sy-table-store-body'>{this.block.data.map((d, i) => {
            return <div className='sy-table-store-body-row' key={i}>{
                this.block.cols.map(col => {
                    var colStyle = {
                        width: col.width + "%"
                    }
                    return <div style={colStyle}
                        key={col.name}
                        className='sy-table-store-body-row-cell'>{d[col.name]}</div>
                })
            }</div>
        })}</div>
    }
    renderFooter() {
        return this.block.pagination && <div className='sy-table-store-footer'></div>
    }
    render() {
        return <div className='sy-table-store'>
            {this.renderHead()}
            {this.renderBody()}
            {this.renderFooter()}
        </div>
    }
}