import React from "react";
import { Icon } from "../../../../component/view/icon";
import { DataGridView } from "../base";
import { Rect } from "../../../../src/common/vector/point";
import { getSchemaViewIcon } from "../../schema/util";
import {
    ChevronDownSvg,
    CollectTableSvg,
    DotsSvg,
    FilterSvg,
    MaximizeSvg,
    SettingsSvg,
    SortSvg
} from "../../../../component/svgs";
import "./style.less";
import { PageLayoutType } from "../../../../src/page/declare";
export class DataGridTool extends React.Component<{ block: DataGridView }>{
    isOpenTool: boolean = false;
    render() {
        var self = this;
        var props = this.props;
        props.block.dataGridTool = this;
        var view = props.block.schema?.views?.find(g => g.id == props.block.syncBlockId)
        if (props.block.isLock == true) return <></>
        if (props.block.noTitle) return <div className='h-20 relative'>
            {props.block.isOver && <div className="flex h-40 pos card round padding-w-10 padding-h-0" style={{ top: -30, left: 0, right: 0 }}>
                <div className="flex-fixed">
                    <label className="cursor flex round h-30 item-hover padding-r-5 text f-14" onMouseDown={e => { e.stopPropagation(); props.block.onOpenViewSettings(Rect.fromEvent(e)) }}>
                        <span className="size-24 bold flex-center flex-fixed">
                            <Icon size={16} icon={view ? getSchemaViewIcon(view.url) : CollectTableSvg}></Icon>
                        </span>
                        <span className="flex-auto">{view?.text}</span>
                    </label>
                </div>
                <div className="sy-dg-tool-operators flex-auto flex-end">
                    <label className="item-hover round padding-w-5 h-24 flex-center cursor gap-r-10" onMouseDown={e => props.block.onOpenViewConfig(Rect.fromEvent(e))}><Icon size={14} icon={SettingsSvg}></Icon><span className="f-14 padding-l-5">视图配置</span></label>
                    {props.block.filter?.items?.length > 0 && <label className="item-hover round  flex-center cursor gap-r-10 padding-w-5 h-24 " onMouseDown={e => props.block.onOpenViewConfig(Rect.fromEvent(e), 'filter')}><Icon size={18} icon={FilterSvg}></Icon><span className="f-14 padding-l-5">过滤</span></label>}
                    {props.block.sorts?.length > 0 && <label className="item-hover round  flex-center cursor gap-r-10 padding-w-5 h-24 " onMouseDown={e => props.block.onOpenViewConfig(Rect.fromEvent(e), 'sort')}><Icon size={18} icon={SortSvg}></Icon><span className="f-14 padding-l-5">排序</span></label>}
                    {props.block.page.pageLayout.type != PageLayoutType.db && <label className="item-hover round size-24 flex-center cursor gap-r-10" onMouseDown={e => { e.stopPropagation(); props.block.onOpenSchemaPage() }}><Icon icon={MaximizeSvg} size={16}></Icon></label>}
                    <label className="item-hover round size-24 flex-center cursor gap-r-10" onMouseDown={e => { e.stopPropagation(); props.block.onOpenViewProperty(Rect.fromEvent(e)) }}><Icon size={18} icon={DotsSvg}></Icon></label>
                    <div className="sy-dg-tool-operators-add">
                        <span className="padding-w-15 text-white" onClick={e => { e.stopPropagation(); props.block.onOpenForm(Rect.fromEvent(e)) }}>新增</span>
                        <span className="icon" onClick={e => { e.stopPropagation(); props.block.onOpenFormDrop(Rect.fromEvent(e)) }}><Icon size={14} icon={ChevronDownSvg}></Icon></span>
                    </div>
                </div>
            </div>}
        </div>
        else return <div className="sy-dg-tool">
            <div className="flex-fixed">
                <label className="cursor flex round h-30 item-hover padding-r-5  text f-14" onMouseDown={e => { e.stopPropagation(); props.block.onOpenViewSettings(Rect.fromEvent(e)) }}>
                    <span className="size-24 flex-center flex-fix">
                        <Icon size={16} icon={view ? getSchemaViewIcon(view.url) : CollectTableSvg}></Icon>
                    </span>
                    <span className="flex-auto bold">{view?.text}</span>
                </label>
            </div>
            {props.block.isOver && props.block.isCanEdit() && <div className="sy-dg-tool-operators  flex-auto flex-end">
                <label className="item-hover round padding-w-5 h-24 flex-center cursor gap-r-10" onMouseDown={e => props.block.onOpenViewConfig(Rect.fromEvent(e))}><Icon size={14} icon={SettingsSvg}></Icon><span className="f-14 padding-l-5">视图配置</span></label>
                {props.block.filter?.items?.length > 0 && <label className="item-hover round padding-w-5 h-24   flex-center cursor gap-r-10" onMouseDown={e => props.block.onOpenViewConfig(Rect.fromEvent(e), 'filter')}><Icon size={18} icon={FilterSvg}></Icon><span className="f-14 padding-l-5">过滤</span></label>}
                {props.block.sorts?.length > 0 && <label className="item-hover round padding-w-5 h-24   flex-center cursor gap-r-10" onMouseDown={e => props.block.onOpenViewConfig(Rect.fromEvent(e), 'sort')}><Icon size={18} icon={SortSvg}></Icon><span className="f-14 padding-l-5">排序</span></label>}
                {props.block.page.pageLayout.type != PageLayoutType.db && <label className="item-hover round size-24 flex-center cursor gap-r-10" onMouseDown={e => { e.stopPropagation(); props.block.onOpenSchemaPage() }}><Icon icon={MaximizeSvg} size={16}></Icon></label>}
                <label className="item-hover round size-24 flex-center cursor gap-r-10" onMouseDown={e => { e.stopPropagation(); props.block.onOpenViewProperty(Rect.fromEvent(e)) }}><Icon size={18} icon={DotsSvg}></Icon></label>
                <div className="sy-dg-tool-operators-add">
                    <span className="padding-w-15 text-white" onClick={e => { e.stopPropagation(); props.block.onOpenForm(Rect.fromEvent(e)) }}>新增</span>
                    <span className="icon" onClick={e => { e.stopPropagation(); props.block.onOpenFormDrop(Rect.fromEvent(e)) }}><Icon size={14} icon={ChevronDownSvg}></Icon></span>
                </div>
            </div>}
        </div>
    }
}


