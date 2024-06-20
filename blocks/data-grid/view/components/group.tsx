import React from "react";
import { DataGridView } from "../base";
import dayjs from "dayjs";
import lodash from "lodash";

import { TriangleSvg, DotsSvg, PlusSvg } from "../../../../component/svgs";
import { Avatar } from "../../../../component/view/avator/face";
import { ToolTip } from "../../../../component/view/tooltip";
import { ls } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import { FieldType } from "../../schema/type";
import { DataGridTableItem } from "../table/row";
import { Icon } from "../../../../component/view/icon";
import { Block } from "../../../../src/block";

export class DataGridGroup extends React.Component<{
    block: DataGridView,
    renderRowContent: (
        block: DataGridView,
        childs?: Block[],
        groupHead?: ArrayOf<DataGridView['dataGroupHeads']>) => JSX.Element
}> {
    hideGroupSpread = false;
    get block() {
        return this.props.block;
    }
    render() {
        var self = this;
        if (this.block.schema) {
            if (this.block.hasGroup) {
                var gf = this.block.schema.fields.find(g => g.id == this.block.groupView.groupId);
                function renderGroupHead(dg) {
                    if (lodash.isNull(dg.value))
                        return <span className="flex-fixed padding-w-5 ">无 <span className="b-500">{gf.text}</span> 数据</span>
                    if ([FieldType.creater, FieldType.modifyer, FieldType.user].includes(gf.type))
                        return <span className="flex-fixed gap-r-3">
                            <Avatar userid={dg.text} size={28}></Avatar>
                        </span>
                    else if ([FieldType.date,
                    FieldType.createDate,
                    FieldType.modifyDate
                    ].includes(gf.type)) {
                        var text = dg.text;
                        if (ls.isCn) {
                            if (self.block.groupView.by == 'year') {
                                text = dg.text + "年";
                            }
                        }
                        if (self.block.groupView.by == 'day' || self.block.groupView.by == 'month') {
                            text = dg.text.replace(/-/g, '/')
                        }
                        else if (self.block.groupView.by == 'week') {
                            var year = parseInt(dg.text.split('~')[0]);
                            var week = parseInt(dg.text.split('~')[1]);
                            var wd = dayjs().year(year).week(week + 1);
                            text = wd.format('YYYY/MM/DD') + "~" + wd.endOf('week').format('YYYY/MM/DD');
                            if (ls.isCn) {
                                text = year + "年" + week + "周(" + wd.format('MM/DD') + "~" + wd.endOf('week').format('MM/DD') + ")"
                            }
                            // var d=dayjs().year(year).week(week).startOf('week').format('YYYY/MM/DD');
                        }
                        return <span className="flex-fixed padding-w-5 b-500">
                            {text}
                        </span>
                    }
                    else if ([FieldType.option, FieldType.options].includes(gf.type)) {
                        var op = gf.config?.options.find(o => o.value == dg.value);
                        var style = { backgroundColor: op?.color, lineheight: '20px' };
                        return <span style={style} className="f-14 round gap-w-3 flex-fixed padding-w-5 b-500">{op.text}</span>
                    }
                    else if ([FieldType.number, FieldType.autoIncrement, FieldType.sort, FieldType.price].includes(gf.type)) {
                        var text = dg.text;
                        var di = dg.id as { min: number, max: number };
                        if (di && typeof di.min == 'number') {
                            text = di.min + '-' + di.max;
                        }
                        return <span className="flex-fixed text-overflow max-w-250 padding-w-5 b-500">{dg.text}</span>
                    }
                    return <span className="flex-fixed text-overflow max-w-250 padding-w-5 b-500">{dg.text}</span>
                }
                var rdg = (dg, i) => {
                    var cs = this.block.childs.findAll(g => {
                        var dr = (g as DataGridTableItem).dataRow as Record<string, any>;
                        return lodash.isEqual(dr.__group, dg.value);
                    })
                    return <div className="visible-hover" key={i}>
                        <div data-sy-table='group-head' className="flex min-h-28 padding-h-5">
                            <span className={'size-24 flex-center round item-hover cursor ts ' + (dg.spread !== false ? "rotate-180" : "rotate-90")} onMouseDown={e => {
                                e.stopPropagation();
                                dg.spread = dg.spread === false ? true : false;
                                this.forceUpdate();
                            }}> <Icon size={10} icon={TriangleSvg}></Icon></span>
                            {renderGroupHead(dg)}
                            <span className="flex-fixed padding-w-3 min-w-24 border-box round flex-center  item-hover cursor remark">{dg.count}</span>
                            {this.block.isCanEdit() && <ToolTip overlay={<S>属性</S>}><span onMouseDown={async e => {
                                e.stopPropagation();
                                var ele = e.currentTarget as HTMLElement;
                                ele.classList.remove('visible')
                                try {
                                    await this.block.onOpenGroupHead(dg, e)
                                }
                                catch (ex) { console.error(ex) }
                                finally {
                                    ele.classList.add('visible')
                                }
                            }} className="visible remark gap-l-10 flex-center flex-fixed size-24 item-hover cursor round"><Icon icon={DotsSvg}></Icon></span></ToolTip>}
                            {this.block.isCanEdit() && <ToolTip overlay={<S>添加新行</S>}><span onMouseDown={e => { e.stopPropagation(); this.block.onOpenAddForm() }} className="visible remark gap-l-10  flex-center  flex-fixed size-24 item-hover cursor round"><Icon icon={PlusSvg}></Icon></span></ToolTip>}
                        </div>
                        {dg.spread !== false && <div className="gap-b-10">
                            {this.props.renderRowContent(this.block, cs, dg)}
                            {/* <DataGridTableContent groupHead={dg} block={this.block} childs={cs}></DataGridTableContent> */}
                        </div>}
                    </div>
                }
                var hides = this.block.dataGroupHeads.findAll(g => this.block.groupView.hideGroups.some(s => lodash.isEqual(g.value, s)));
                return <div>
                    {this.block.dataGroupHeads.findAll(g => !this.block.groupView.hideGroups.some(s => lodash.isEqual(g.value, s))).map((dg, i) => {
                        return rdg(dg, i)
                    })}
                    {hides.length > 0 && <div>
                        <div className="flex min-h-28 gap-h-5" onMouseDown={e => {
                            e.stopPropagation();
                            this.hideGroupSpread = this.hideGroupSpread === false ? true : false;
                            this.forceUpdate();
                        }}>
                            <span className="item-hover f-14 cursor round flex remark padding-w-5  ">
                                <span className={"size-16 gap-r-3 flex-center round  cursor ts " + (this.hideGroupSpread == true ? "" : "rotate-180")}><Icon size={16} icon={{ name: 'byte', code: "up" }}></Icon></span>
                                <span className="gap-r-3">{hides.length}</span>
                                <S>隐藏的分组</S>
                            </span>
                        </div>
                        {this.hideGroupSpread && <div>
                            {hides.map((dg, i) => { return rdg(dg, i) })}
                        </div>}
                    </div>}
                </div>
            }
            else {
                return this.props.renderRowContent(this.block, this.block.childs, undefined)
                // return <DataGridTableContent block={this.block} ></DataGridTableContent>
            }
        }
        else return <></>
    }
}