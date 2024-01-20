import React from "react";
import { Icon } from "../../../../component/view/icon";
import { DataGridView } from "../base";
import { Rect } from "../../../../src/common/vector/point";
import { getSchemaViewIcon } from "../../schema/util";
import {
    ChevronDownSvg,
    CloseSvg,
    DotsSvg,
    FilterSvg,
    MaximizeSvg,
    PlusSvg,
    SortSvg
} from "../../../../component/svgs";
import { PageLayoutType } from "../../../../src/page/declare";
import { S } from "../../../../i18n/view";
import { lst } from "../../../../i18n/store";
import "./style.less";
import { Tip } from "../../../../component/view/tooltip/tip";
import { DataGridTab } from "../tab";

export class RenderToolOperators extends React.Component<{ block: DataGridView, dataGridTab?: DataGridTab }>{
    isOpenTool: boolean = false;
    render() {
        var props = this.props;
        var self = this;
        var is = true;
        if (props.dataGridTab) is = props.dataGridTab.isOver || props.block.searchTitle.focus == true
        if (is)
            return <div className="flex-end">
                {props.block.isCanEdit() && <><label className="item-hover round padding-w-5 h-24 flex-center cursor gap-r-10 text-1 " onMouseDown={e => props.block.onOpenViewConfig(Rect.fromEvent(e))}><Icon size={16} icon={{ name: 'byte', code: 'setting-one' }}></Icon><span className="f-14 padding-l-5"><S>视图配置</S></span></label>
                    {props.block.filter?.items?.length > 0 && <label className="item-hover round  flex-center cursor gap-r-10 padding-w-5 h-24 text-1 " onMouseDown={e => props.block.onOpenViewConfig(Rect.fromEvent(e), 'filter')}><Icon size={16} icon={FilterSvg}></Icon><span className="f-14 padding-l-5"><S>过滤</S></span></label>}
                    {props.block.sorts?.length > 0 && <label className="item-hover round  flex-center cursor gap-r-10 padding-w-5 h-24  text-1 " onMouseDown={e => props.block.onOpenViewConfig(Rect.fromEvent(e), 'sort')}><Icon size={16} icon={SortSvg}></Icon><span className="f-14 padding-l-5"><S>排序</S></span></label>}
                    {props.block.page.pageLayout.type != PageLayoutType.db && <label className="item-hover round size-24 flex-center cursor gap-r-10 text-1" onMouseDown={e => { e.stopPropagation(); props.block.onOpenSchemaPage() }}><Icon icon={MaximizeSvg} size={14}></Icon></label>}
                    <label onMouseDown={e => {
                        e.stopPropagation();
                    }}
                        className={"flex gap-r-10  " + (props.block.searchTitle.focus ? " relative" : "")}>
                        <span onMouseDown={e => {
                            props.block.searchTitle.focus = !props.block.searchTitle.focus;
                            if (!props.block.searchTitle.focus) {
                                if (props.block.searchTitle.word) {
                                    props.block.searchTitle.word = '';
                                    props.block.onSearch();
                                }
                            }
                            self.forceUpdate();
                        }} className="flex-fixed text-1 size-24 item-hover round flex-center cursor"><Icon size={16} icon={{ name: 'byte', code: 'search' }}></Icon></span>
                        <input
                            style={{
                                width: props.block.searchTitle.focus ? '100px' : '0px',
                                transition: 'width 0.3s',
                                height: '24px',
                                lineHeight: '24px',
                                backgroundColor: 'transparent'
                                // display: props.block.searchTitle.focus ? 'inline-block' : 'none'
                            }}
                            placeholder={lst('搜索...')}
                            type="text"
                            className="noborder flex-auto"
                            defaultValue={props.block.searchTitle.word}
                            onInput={e => {
                                props.block.searchTitle.word = e.currentTarget.value.trim();
                                props.block.onLazySearch();
                            }}
                            onBlur={async e => {
                                if (!props.block.searchTitle.word) {
                                    props.block.searchTitle.focus = false;
                                    if (props.block.searchTitle.word) {
                                        props.block.searchTitle.word = '';
                                        await props.block.onSearch()
                                    }
                                    self.forceUpdate();
                                }
                            }}
                        />
                        {props.block.searchTitle.word && <span
                            onMouseDown={async e => {
                                e.stopPropagation();
                                props.block.searchTitle.word = '';
                                props.block.searchTitle.focus = false;
                                await props.block.onSearch()
                                self.forceUpdate()
                            }}
                            className="pos w-20 flex-center cursor text-1 round" style={{
                                right: 0,
                                top: 0,
                                bottom: 0
                            }}>
                            <span className="flex-center size-20 cursor item-hover round"><Icon size={14} icon={CloseSvg}></Icon></span>
                        </span>}
                    </label>
                    <label className="item-hover round size-24 flex-center cursor gap-r-10 text-1" onMouseDown={e => { e.stopPropagation(); props.block.onOpenViewProperty(Rect.fromEvent(e)) }}><Icon size={16} icon={DotsSvg}></Icon></label></>}
                {props.block.isCanAddRow() && <div className="sy-dg-tool-operators-add">
                    <span className={"padding-l-15 text-white" + (!props.block.isCanEdit() ? " padding-r-15" : "")} onClick={e => { e.stopPropagation(); props.block.onOpenAddForm(undefined, true) }}><S>新增</S></span>
                    {props.block.isCanEdit() && <span className="flex-center cursor size-16 padding-l-5 padding-r-5" onClick={e => { e.stopPropagation(); props.block.onOpenViewTemplates(Rect.fromEvent(e)) }}><Icon size={14} icon={ChevronDownSvg}></Icon></span>}
                </div>}
            </div>
        else return <></>
    }
}

export class DataGridTool extends React.Component<{ block: DataGridView }>{
    isOpenTool: boolean = false;
    render() {
        if (this.props.block?.dataGridTab) return <></>
        var self = this;
        var props = this.props;
        props.block.dataGridTool = this;
        var view = props.block.schema?.views?.find(g => g.id == props.block.syncBlockId)
        if (!view) return <></>
        if (props.block.noTitle) {
            if (props.block.isCanEdit())
                return <div className='h-20 relative'>
                    {(props.block.isOver || props.block.searchTitle.focus == true) && <div className="flex h-40 pos shadow bg-white round padding-w-10 padding-h-0" style={{
                        top: -30,
                        left: 0,
                        right: 0,
                        zIndex: 3000
                    }}><div className="flex-fixed">
                            <label className="cursor flex round  item-hover padding-r-5 text f-14" onMouseDown={e => {
                                if (!props.block.page.isSign) return;
                                e.stopPropagation();
                                props.block.onOpenViewSettings(Rect.fromEvent(e))
                            }}>
                                <span className="size-24 bold flex-center flex-fixed">
                                    <Icon size={18} icon={getSchemaViewIcon(view)}></Icon>
                                </span>
                                <span className="flex-auto">{view?.text}</span>
                            </label>
                        </div>
                        <div className="flex-auto">
                            <RenderToolOperators block={this.props.block}></RenderToolOperators>
                        </div>
                    </div>}
                </div>
            else return <></>
        }
        else return <div className="h-30 flex">
            <div className="flex-fixed flex">
                <label className="cursor flex round  item-hover padding-r-5  text f-14"
                    onMouseDown={e => {
                        if (!props.block.page.isSign) return;
                        e.stopPropagation();
                        props.block.onOpenViewSettings(Rect.fromEvent(e))
                    }}>
                    <span className="size-24 flex-center flex-fix">
                        <Icon size={16} icon={getSchemaViewIcon(view)}></Icon>
                    </span>
                    <span className="flex-auto bold">{view?.text}</span>
                </label>
                {props.block.isCanEdit() && (props.block.isOver || props.block.searchTitle.focus == true) && <Tip text="添加视图"><div onMouseDown={e => {
                    props.block.onOpenAddTabView(e)
                }} className="flex-center round size-20 gap-l-5 item-hover cursor">
                    <Icon size={16} icon={PlusSvg}></Icon>
                </div></Tip>}
            </div>
            {(props.block.isOver || props.block.searchTitle.focus == true) && <div className="flex-auto">
                <RenderToolOperators block={this.props.block}></RenderToolOperators>
            </div>}
        </div>
    }
}





