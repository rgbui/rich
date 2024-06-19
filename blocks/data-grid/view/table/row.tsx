import React, { CSSProperties } from "react";
import { TableStore } from ".";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "../../element/field/origin.field";
import { TableGridItem } from "../item";
import { S } from "../../../../i18n/view";
import { PlusSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { ChildsArea } from "../../../../src/block/view/appear";

@url('/data-grid/table/row')
export class DataGridTableItem extends TableGridItem {
    get isShowHandleBlock(): boolean {
        return true;
    }
}

@view('/data-grid/table/row')
export class DataGridTableItemView extends BlockView<DataGridTableItem> {
    renderView() {
        var totalWidth = (this.block.dataGrid as TableStore).sumWidth;
        var rowStyle: CSSProperties = {
            width: totalWidth
        }
        if (!this.block.dataGrid.dataGridIsCanEdit()) {
            rowStyle = {
                minWidth: totalWidth
            }
        }
        return <div>
            <div className='sy-dg-table-row visible-hover' style={rowStyle}>
                {this.block.childs.map((block: OriginField, i) => {
                    var w = block?.viewField?.colWidth || 120;
                    var style: CSSProperties = {
                        width: w
                    }
                    if (i == 0 && this.block.subDeep > 0) {
                        var pl = this.block.subDeep * 24;
                        style.paddingLeft = pl;
                        style.width = w;
                    }
                    if (!this.block.dataGrid.dataGridIsCanEdit() && i == this.block.fields.length - 1) {
                        style = {
                            minWidth: w,
                            flexGrow: 1,
                            flexShrink: 1
                        }
                    }
                    return <div key={block.id} onMouseDown={e => block.onCellMousedown(e)} className='sy-dg-table-row-cell' style={style}>
                        <block.viewComponent block={block}></block.viewComponent>
                    </div>
                })}
                {this.block.dataGrid.dataGridIsCanEdit() && <div className='sy-dg-table-row-cell' style={{ minWidth: 40, flexGrow: 1, flexShrink: 1 }}></div>}
            </div>
            {this.renderSubs()}
        </div>
    }
    renderSubs() {
        if (this.block.dataGrid?.schema?.allowSubs) {
            var totalWidth = (this.block.dataGrid as TableStore).sumWidth;
            var pl = (this.block.subDeep + 1) * 24 + 20;
            if (this.block.subSpread == true) {
                return <div>
                    <div>
                        <ChildsArea childs={this.block.subChilds}></ChildsArea>
                    </div>
                    <div className="flex h-28 item-hover remark cursor" onMouseDown={e => {
                        e.stopPropagation()
                        this.block.onAddSub(e)
                    }} style={{
                        width: totalWidth - pl,
                        paddingLeft: pl,
                        borderBottom: '1px solid #ddd'
                    }}>
                        <span className="flex-fixed gap-l-6 flex-center size-20"> <Icon size={18} icon={PlusSvg}></Icon></span>
                        <span className="flex-fixed  gap-l-3 f-14"><S>添加子数据</S></span>
                    </div>
                </div>
            }
        }
        return <></>
    }
}
