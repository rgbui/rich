import React, { ReactNode } from "react";
import { EventsComponent } from "../../../../component/lib/events.component";
import { Select } from "../../../../component/view/select";
import { Icon } from "../../../../component/view/icon";
import { Remark } from "../../../../component/view/text";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import "./style.less";
import { Divider } from "../../../../component/view/grid";
import { CloseTickSvg, DragHandleSvg, PlusSvg } from "../../../../component/svgs";
import { DataGridView } from "../../../../blocks/data-grid/view/base";

export class TableSortView extends EventsComponent<{ dataGrid: DataGridView }>{
    get block() {
        return this.props.dataGrid;
    }
    get schema() {
        return this.props.dataGrid?.schema;
    }
    get sorts() {
        return this.block.sorts || [];
    }
    getFields() {
        return this.schema.fields.findAll(x => x.text ? true : false).map(fe => {
            return {
                text: fe.text,
                value: fe.id
            }
        })
    }
    render(): ReactNode {
        if (!this.props.dataGrid) return <></>;
        var self = this;
        function addSort() {
            var f = self.schema.fields.find(g => g.type == FieldType.title);
            if (!f) f = self.schema.fields.findAll(g => g.text ? true : false).first();
            self.sorts.push({ field: f.id, sort: 1 });
            self.forceUpdate()
        }
        function removeSort(at: number) {
            self.sorts.splice(at, 1);
            self.forceUpdate();
        }
        var hasSorts = Array.isArray(this.sorts) && this.sorts.length > 0;
        return <div className="shy-table-sorts-view">
            {/* <div className="shy-table-sorts-view-head"><span>设置排序</span></div> */}
            <div className="shy-table-sorts-view-content">
                {hasSorts && this.sorts.map((so, i) => {
                    return <div className="shy-table-sorts-view-item" key={i}>
                        <Icon size={14} style={{ padding: 10 }} wrapper className={'drag'} icon={DragHandleSvg}></Icon>
                        <Select border style={{ minWidth: 80 }} value={so.field} options={this.getFields()} onChange={e => { so.field = e; self.forceUpdate() }}></Select>
                        <Select border style={{ minWidth: 80 }} value={so.sort} options={[
                            { text: '降序', value: -1 },
                            { text: '升序', value: 1 }
                        ]} onChange={e => { so.sort = e; self.forceUpdate() }}>
                        </Select>
                        <div style={{ flexGrow: 1, flexShrink: 1 }}></div>
                        <Icon size={12} style={{ padding: 6 }} wrapper className={'close'} icon={CloseTickSvg} click={e => removeSort(i)}></Icon>
                    </div>
                })}
                {!hasSorts && <Remark> </Remark>}
            </div>
            <Divider></Divider>
            <div className="shy-table-sorts-view-footer">
                <a style={{
                    fontSize: 14,
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    cursor: 'pointer'
                }} onClick={e => addSort()}><Icon size={14} style={{ marginRight: 5 }} icon={PlusSvg}></Icon>添加排序</a>
            </div>
        </div>
    }
}
