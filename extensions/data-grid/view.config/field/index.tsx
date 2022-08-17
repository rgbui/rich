import React from "react";
import { ReactNode } from "react";
import { getTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import { Icon } from "../../../../component/view/icon";
import { Remark } from "../../../../component/view/text";
import { Divider } from "../../../../component/view/grid";
import { DragHandleSvg, EyeHideSvg, EyeSvg, PlusSvg } from "../../../../component/svgs";
import "./style.less";
import { Rect } from "../../../../src/common/vector/point";
import { DragList } from "../../../../component/view/drag.list";

export class DataGridFields extends EventsComponent {
    get schema() {
        return this.block?.schema;
    }
    block: DataGridView;
    onOpen(block: DataGridView) {
        this.block = block;
        this.forceUpdate();
    }
    render(): ReactNode {
        if (!this.block) return <></>;
        if (!this.schema) return <div></div>
        var fs = this.schema.userFields.findAll(g => g.text && !this.block.fields.some(s => s.fieldId == g.id) ? true : false);
        var self = this;
        function addField(event: React.MouseEvent) {
            event.stopPropagation();
            self.block.onAddField(Rect.fromEvent(event));
        }
        async function onShowAll() {
            await self.block.onShowAllField();
            self.forceUpdate();
        }
        async function onHideAll() {
            await self.block.onHideAllField();
            self.forceUpdate();
        }
        async function onChange(to: number, from: number) {
            await self.block.onMoveViewField(to, from);
            self.forceUpdate();
        }
        return <div className="shy-table-field-view">
            <div style={{ overflowY: 'auto', maxHeight: 250 }}>
                <div className="shy-table-field-view-operator">
                    <Remark>显示的字段</Remark>
                    <Icon size={14} onClick={e => onHideAll()} icon={EyeSvg}></Icon>
                </div>
                <DragList onChange={onChange} isDragBar={e => e.closest('.shy-table-field-view-item') && !e.closest('.eye') ? true : false} className="shy-table-field-view-items">  {this.block.fields.map(f => {
                    return <div className={"shy-table-field-view-item"} key={f.fieldId || f.type}>
                        <em className={'drag'} ><Icon size={12} icon={DragHandleSvg}></Icon></em>
                        <Icon size={14} icon={getTypeSvg(f.field?.type)}></Icon>
                        <span>{f.text}</span>
                        <Icon className={'eye'} size={14} onClick={async () => { await self.block.onHideField(f); self.forceUpdate() }} icon={EyeSvg}></Icon>
                    </div>
                })}</DragList>
                {fs.length > 0 && <>
                    <div className="shy-table-field-view-operator">
                        <Remark>未显示的字段</Remark>
                        <Icon size={14} onClick={e => onShowAll()} icon={EyeHideSvg}></Icon>
                    </div>
                    <div className="shy-table-field-view-items">{fs.map(f => {
                        return <div className={"shy-table-field-view-item" + (" hide")} key={f.id}>
                            <Icon size={14} icon={getTypeSvg(f.type)}></Icon>
                            <span>{f.text}</span>
                            <Icon className={'eye'} size={14} onClick={async () => { await self.block.onShowField(f); self.forceUpdate() }} icon={EyeHideSvg}></Icon>
                        </div>
                    })}</div>
                </>}
            </div>
            <Divider></Divider>
            <div className="shy-table-field-view-add">
                <a style={{
                    fontSize: 14,
                    display: 'inline-flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    cursor: 'pointer'
                }} onClick={e => addField(e)}><Icon size={14} style={{ marginRight: 5 }} icon={PlusSvg}></Icon>添加字段</a>
            </div>
        </div>
    }
}