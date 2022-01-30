
import React from 'react';
import { url } from "../../../../src/block/factory/observable";
import { Pattern } from "../../../../src/block/pattern";
import { util } from "../../../../util/util";
import { FieldType } from "../../schema/type";
import { ActionDirective } from "../../../../src/history/declare";
import { Field } from "../../schema/field";
import { Confirm } from "../../../../component/lib/confirm";
import { useTableStoreAddField } from "../../../../extensions/tablestore/field";
import { Rect } from "../../../../src/common/vector/point";
import { useFormPage } from "../../../../extensions/tablestore/form";
import { DataGridView } from '../base/table';
import { Block } from '../../../../src/block';
import { ViewField } from '../../schema/view';
import "./style.less";
import { BlockFactory } from '../../../../src/block/factory/block.factory';
import { DataGridTableItem } from './row';
/***
 * 数据总共分三部分
 * 1. 数据源（调用第三方接口获取数据），编辑的数据源需要触发保存
 * 2. 表格的元数据信息（来源于全局的表格元数据信息)
 * 3. 表格的视图展示（具体到视图的展现,信息存在tableStore） 
 * 
 */
@url('/data-grid/table')
export class TableStore extends DataGridView {
  
    async get() {
        var json: Record<string, any> = { id: this.id, url: this.url };
        if (typeof this.pattern.get == 'function')
            json.pattern = await this.pattern.get();
        else {
            console.log(this, this.pattern);
        }
        json.blocks = {
            childs: [],
            rows: []
        };
        if (Array.isArray((this as any).__props)) {
            (this as any).__props.each(pro => {
                if (Array.isArray(this[pro])) {
                    json[pro] = this[pro].map(pr => {
                        if (typeof pr?.get == 'function') return pr.get();
                        else return util.clone(pr);
                    })
                }
                else if (typeof this[pro] != 'undefined') {
                    if (typeof this[pro]?.get == 'function')
                        json[pro] = this[pro].get();
                    else json[pro] = util.clone(this[pro]);
                }
            })
        }
        return json;
    }
    async createItem() {
        this.blocks.childs = [];
        for (let i = 0; i < this.data.length; i++) {
            var row = this.data[i];
            var rowBlock: DataGridTableItem = await BlockFactory.createBlock('/data-grid/table/row', this.page, { mark: i, dataRow: row }, this) as DataGridTableItem;
            this.blocks.childs.push(rowBlock);
            await rowBlock.createElements();
        }
    }
}


