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

export function DataGridTool(props: { block: DataGridView }) {
    return <div className="sy-dg-tool">
        <div className="sy-dg-tool-templates">
            <label>
                <Icon size={14} icon={collectTable}></Icon>
                <span>模板</span>
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