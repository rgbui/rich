import React from "react";
import { Icon } from "../../../../component/view/icon";
import { DataGridView } from "../base";
import { Rect } from "../../../../src/common/vector/point";
import { getSchemaViewIcon } from "../../schema/util";
import {
    ChevronDownSvg,
    CollectTableSvg,
    SettingsSvg
} from "../../../../component/svgs";
import "./style.less";
export class DataGridTool extends React.Component<{ block: DataGridView }>{
    isOpenTool: boolean = false;
    render() {
        var self = this;
        var props = this.props;
        props.block.dataGridTool = this;
        var view = props.block.schema?.views?.find(g => g.id == props.block.syncBlockId)
        if (props.block.isLock == true) return <></>
        return <div className="sy-dg-tool">
            {(props.block.noTitle && props.block.isOver || !props.block.noTitle) && <div className="sy-dg-tool-title">
                <label onMouseDown={e => { e.stopPropagation(); props.block.onOpenViewSettings(Rect.fromEvent(e)) }}>
                    <Icon size={14} icon={view ? getSchemaViewIcon(view.url) : CollectTableSvg}></Icon>
                    <span>{view?.text}</span>
                </label>
            </div>}
            {props.block.isOver && <div className="sy-dg-tool-operators">
                <label onMouseDown={e => props.block.onOpenViewConfig(Rect.fromEvent(e))}><Icon size={14} icon={SettingsSvg}></Icon><span>视图配置</span></label>
                {/* <label onMouseDown={e => openFilterView(e)}><Icon size={14} icon={FilterSvg}></Icon><span>过滤</span></label>
                <label onMouseDown={e => openSortView(e)}><Icon size={14} icon={SortSvg}></Icon><span>排序</span></label> */}
                <label onMouseDown={e => { e.stopPropagation(); props.block.onOpenViewProperty(Rect.fromEvent(e)) }}><Icon size={14} icon='elipsis:sy'></Icon></label>
                <div className="sy-dg-tool-operators-add">
                    <span className="text" onClick={e => { e.stopPropagation(); props.block.onOpenForm(Rect.fromEvent(e)) }}>新增</span>
                    <span className="icon" onClick={e => { e.stopPropagation(); props.block.onOpenFormDrop(Rect.fromEvent(e)) }}><Icon size={10} icon={ChevronDownSvg}></Icon></span>
                </div>
            </div>}
        </div>
    }
}


