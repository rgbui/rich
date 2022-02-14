import React from "react";
import { Button } from "../../../../component/view/button";
import { Icon } from "../../../../component/view/icon";
import { DataGridView } from "../base/table";
import Settings from "../../../../src/assert/svg/settings.svg";
import Filter from "../../../../src/assert/svg/filter.svg";
import Sort from "../../../../src/assert/svg/sort.svg";
import chevronDown from "../../../../src/assert/svg/chevronDown.svg";
import collectTable from "../../../../src/assert/svg/collectTable.svg";
import "./style.less";
import { useTableSortView } from "../../../../extensions/tablestore/sort";
import { Rect } from "../../../../src/common/vector/point";
import { useTabelSchemaViewDrop } from "../../../../extensions/tablestore/switch.views/view";
import { getSchemaViewIcon } from "../../schema/util";
export function DataGridTool(props: { block: DataGridView }) {
    async function changeDataGridView(event: React.MouseEvent) {
        var result = await useTabelSchemaViewDrop({ roundArea: Rect.fromEvent(event) }, {
            schema: props.block.schema
        });
        if (result) {
            props.block.onDataGridTurnView(result.id);
        }
    }
    async function openSortView(event: React.MouseEvent) {

    }
    async function openFilterView(event: React.MouseEvent) {

    }
    async function openConfigView(event: React.MouseEvent) {

    }
    var view = props.block.schema?.views?.find(g => g.id == props.block.syncBlockId)
    return <div className="sy-dg-tool">
        <div className="sy-dg-tool-templates">
            <label onMouseDown={e => changeDataGridView(e)}>
                <Icon size={14} icon={view ? getSchemaViewIcon(view.url) : collectTable}></Icon>
                <span>{view?.text}</span>
                <Icon size={10} icon={chevronDown}></Icon>
            </label>
        </div>
        <div className="sy-dg-tool-operators">
            <label><Icon size={14} icon={Settings}></Icon><span>配置</span></label>
            <label><Icon size={14} icon={Filter}></Icon><span>过滤</span></label>
            <label><Icon size={14} icon={Sort}></Icon><span>排序</span></label>
            <label><Icon size={14} icon='elipsis:sy'></Icon></label>
            <Button size='normal'><span>新增</span><Icon size={10} icon={chevronDown}></Icon></Button>
        </div>
    </div>
}