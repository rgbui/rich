
import React, { ReactNode } from "react";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { GetFieldTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import { Icon } from "../../../../component/view/icon";
import { Switch } from "../../../../component/view/switch";
import { BlockUrlConstant } from "../../../../src/block/constant";
import "./style.less";

export class DataGridControl extends EventsComponent {
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

        return <div className="f-14 max-h-300 overflow-y">

            <div className="remark f-12 padding-w-14  gap-t-10">扩展视图控制块</div>

            <div className="flex item-hover round h-30 padding-w-14 ">
                <span className="flex-auto">分页</span>
                <span className="flex-fix"><Switch checked={false} onChange={e => { this.block.onExtendControlBlock(BlockUrlConstant.DataGridPage, {}, e) }}></Switch></span>
            </div>

            {/*<div className="flex item-hover round h-30 padding-w-14 ">
                <span className="flex-auto">显示批量选中的数据</span>
                <span className="flex-fix"><Switch checked={false} onChange={e => { this.block.onExtendControlBlock(BlockUrlConstant.Button, {}, e) }}></Switch></span>
            </div> */}

            <div className="flex item-hover round h-30 padding-w-14 ">
                <span className="flex-auto">批量删除按钮</span>
                <span className="flex-fix"><Switch checked={false} onChange={e => { this.block.onExtendControlBlock(BlockUrlConstant.Button, { content: '批量删除', action: 'batchDelete' }, e) }}></Switch></span>
            </div>

            <div className="flex item-hover round h-30 padding-w-14 ">
                <span className="flex-auto">添加数据按钮</span>
                <span className="flex-fix"><Switch checked={false} onChange={e => { this.block.onExtendControlBlock(BlockUrlConstant.Button, { content: '添加', action: 'add' }, e) }}></Switch></span>
            </div>

            {/* <div className="flex item-hover round h-30 padding-w-14 ">
                <span className="flex-auto">导入数据</span>
                <span className="flex-fix"><Switch checked={false} onChange={e => { }}></Switch></span>
            </div> */}

            <div className="flex item-hover round h-30 padding-w-14 ">
                <span className="flex-auto">导出数据</span>
                <span className="flex-fix"><Switch checked={false} onChange={e => { this.block.onExtendControlBlock(BlockUrlConstant.Button, { content: '导出', action: 'export' }, e) }}></Switch></span>
            </div>

            <div className="remark f-12 padding-w-14 gap-t-10">扩展字段控制块</div>
            {this.block.schema.visibleFields.findAll(g => ![
                FieldType.video,
                FieldType.button,
                FieldType.audio,
                FieldType.parentId,
                FieldType.image,
                FieldType.file,
                FieldType].includes(g.type)).map(f => {
                    return <div key={f.id} className="flex item-hover round h-30 padding-w-14 ">
                        <span className="flex-fix size-24 flex-center cursor round item-hover"><Icon size={16} icon={GetFieldTypeSvg(f.type)}></Icon></span>
                        <span className="flex-auto">{f.text}</span>
                        <span className="flex-fix"><Switch checked={false} onChange={e => { }}></Switch></span>
                    </div>
                })}
        </div>
    }
}