
import { url } from "../../../../src/block/factory/observable";
import { DataGridView } from '../base';
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
    async createItem() {
        this.blocks.childs = [];
        for (let i = 0; i < this.data.length; i++) {
            var row = this.data[i];
            var rowBlock: DataGridTableItem = await BlockFactory.createBlock('/data-grid/table/row', this.page, { mark: i, dataIndex: i, dataRow: row }, this) as DataGridTableItem;
            this.blocks.childs.push(rowBlock);
            await rowBlock.createElements();
        }
    }
     onOver(isOver: boolean) {
        if (isOver == false && (this.view as any).isMoveLine == false&& (this.view as any).subline) {
            (this.view as any).subline.style.display = 'none';
        }
        return super.onOver(isOver);
    }
}


