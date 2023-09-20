
import React, { ReactNode } from "react";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { GetFieldTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import { FilterSvg, SortSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { ToolTip } from "../../../../component/view/tooltip";
import "./style.less";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";

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
            <div className="remark f-12 padding-w-10 gap-w-5 gap-t-10"><S text='字段组件触发器'>字段组件触发器(查询/排序)</S></div>
            {this.block.schema.visibleFields.findAll(g => ![
                // FieldType.video,
                FieldType.formula,
                FieldType.rollup,
                FieldType.button,
                FieldType.deleted,
                // FieldType.audio,
                FieldType.parentId,
                // FieldType.image,
                // FieldType.file,

            ].includes(g.type)).map(f => {
                return <div key={f.id} className="flex item-hover round h-30 padding-w-5 gap-w-5 ">
                    <span className="flex-fix size-24 flex-center cursor round item-hover"><Icon size={14} icon={GetFieldTypeSvg(f.type)}></Icon></span>
                    <span className="flex-auto">{f.text}</span>
                    <ToolTip overlay={lst("点击插入过滤组件块")}>
                        <span onMouseDown={e => this.block.onExtendControlFilter(f)} className="flex-fix size-24 flex-center cursor round item-hover">
                            <Icon size={16} icon={FilterSvg}></Icon>
                        </span>
                    </ToolTip>
                    <ToolTip overlay={lst("点击插入排序组件块")}>
                        <span onMouseDown={e => this.block.onExtendControlSort(f)} className="flex-fix size-24 flex-center cursor round item-hover">
                            <Icon size={16} icon={SortSvg}></Icon>
                        </span>
                    </ToolTip>
                </div>
            })}
        </div>
    }
}