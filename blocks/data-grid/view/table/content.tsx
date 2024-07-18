import React, { CSSProperties } from "react";
import { Block } from "../../../../src/block";
import { CheckSvg, DotsSvg, PlusSvg } from "../../../../component/svgs";
import { Icon, IconValueType } from "../../../../component/view/icon";
import { Spin } from "../../../../component/view/spin";
import { ToolTip } from "../../../../component/view/tooltip";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { Point, Rect } from "../../../../src/common/vector/point";
import { GetFieldTypeSvg, getFieldStatItems } from "../../schema/util";
import { TableStore } from ".";
import lodash from "lodash";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MouseDragger } from "../../../../src/common/dragger";
import { ghostView } from "../../../../src/common/ghost";
import { ViewField } from "../../schema/view";
import { util } from "../../../../util/util";
import dayjs from "dayjs";
import { DataGridView } from "../base";
import { DataGridTableItem } from "./row";


export class DataGridTableContent extends React.Component<{
    block: Block,
    childs?: Block[],
    groupHead?: ArrayOf<DataGridView['dataGroupHeads']>
}> {
    get block() {
        return this.props.block as TableStore
    }
    async onOpenFieldStat(e: React.MouseEvent, f: ViewField) {
        var items = getFieldStatItems(f.field?.type);
        if (items.length == 0) return;
        if (!f.fieldId) return;
        e.stopPropagation()
        var oss = this.block.statFields?.find(g => g.fieldId == f.fieldId);
        var item = items.find(g => g.value == oss?.stat);
        if (item) item.checkLabel = true;
        else {
            item = items[0]
            item.checkLabel = true;
        }
        var r = await useSelectMenuItem(
            { roundArea: Rect.fromEle(e.currentTarget as HTMLElement) },
            items, { width: Math.max(Rect.fromEle(e.currentTarget as HTMLElement).width, 120) });
        if (r) {
            var oldSf = lodash.cloneDeep(this.block.statFields);
            if (!Array.isArray(oldSf)) oldSf = [];
            lodash.remove(oldSf, g => g.fieldId == f.fieldId);
            if (r.item.name != 'none')
                oldSf.push({ fieldId: f.fieldId, stat: r.item.value });
            await this.block.onUpdateProps({ statFields: oldSf });
            await this.block.loadSchemaStats();
            this.forceUpdate();
        }
    }

    el: HTMLElement;
    render() {
        return <div ref={e => this.el = e}>
            {this.block.schema && this.block.noHead !== true && this.renderHead()}
            {this.block.schema && this.renderBody()}
            {this.block.schema && this.block.dataGridIsCanEdit() && this.renderStat()}
        </div>
    }
    renderHead() {
        return <div className="h-36">
            <DataGridTableHead block={this.block}></DataGridTableHead>
        </div>
    }
    renderBody() {
        var self = this;
        if (this.block.data) {
            var cs = this.props.childs || this.block.childs;
            return <div className='sy-dg-table-body'>
                <ChildsArea childs={cs}></ChildsArea>
                {this.block.isCanAddRow() && <div
                    style={{ width: this.block.sumWidth + 'px' }}
                    onMouseDown={e => {
                        e.stopPropagation();
                        var props = this.block.getGroupCreateDataProps(this.props.groupHead)
                        if (this.props.groupHead && Object.keys(props).length > 0) {
                            if (typeof this.props.groupHead.count == 'number') {
                                this.props.groupHead.count += 1;
                            }
                        }
                        self.block.onSyncAddRow(props,
                            (cs.last() as DataGridTableItem)?.dataId, 'after', false, async (row) => {
                                if (this.props.groupHead)
                                    row.__group = [this.props.groupHead.id];
                                await this.block.loadSchemaStats()
                                this.block.forceManualUpdate()
                            })
                    }}
                    className="sy-dg-table-add padding-w-5 item-hover">
                    <ToolTip overlay={lst('添加新行')}><span className="flex flex-inline cursor  round padding-w-5">
                        <span className="size-24 round flex-center "><Icon size={18} icon={PlusSvg}></Icon></span>
                        <span className="f-14"><S>新增</S></span>
                    </span></ToolTip>
                </div>}
            </div>
        }
        else return <></>
    }
    renderStat() {
        return <div className="flex sy-dg-table-row">
            {this.block.fields.map((f, i) => {
                var style: CSSProperties = {
                    width: f.colWidth || 120,
                    boxSizing: 'border-box',
                    paddingRight: 10
                }
                if (!this.block.dataGridIsCanEdit() && i == this.block.fields.length - 1) {
                    style = {
                        minWidth: f.colWidth || 120,
                        flexGrow: 1,
                        flexShrink: 1
                    }
                }
                var sfl = this.block.statFieldsList.stats;
                if (this.props.groupHead) {
                    sfl = this.block.groupstatFieldsList.groupStats.find(c => lodash.isEqual(c.id, this.props.groupHead.value))?.groupStats
                }

                var sf = sfl ? sfl.find(g => g.fieldId == f.fieldId) : null;
                if (sf?.stat == 'none') sf = null;
                var sff = this.block.schema.fields.find(g => g.id == f.fieldId)
                var si = sff ? getFieldStatItems(sff.type).find(c => c.value == sf?.stat) : null;
                var rv = () => {
                    if (['notFilledPercent', 'filledPercent'].includes(sf.stat)) {
                        return util.toPercent(sf.value as number, sf.total as number, 2)
                    }
                    else if (['dateMin', 'dateMax'].includes(sf.stat)) {
                        if (sf.value instanceof Date) return dayjs(sf.value).format('YYYY/MM/DD')
                        else return lst('无')
                    }
                    else if (['dateRange'].includes(sf.stat)) {
                        var ds: dayjs.Dayjs[] = [];
                        if (sf.value instanceof Date) ds.push(dayjs(sf.value))
                        if (sf.total instanceof Date) ds.push(dayjs(sf.total))
                        if (ds.length == 2) return ds[1].diff(ds[0], 'day') + lst('天')
                        return 0
                    }
                    else if (['min', 'max'].includes(sf.stat)) {
                        if (typeof sf.value == 'number') return sf.value
                        else return lst('无')
                    }
                    else if (['range'].includes(sf.stat)) {
                        var cs: number[] = [];
                        if (typeof sf.value == 'number') cs.push(sf.value)
                        if (typeof sf.total == 'number') cs.push(sf.total)
                        return cs.join(' - ')
                    }
                    else return sf.value;
                }
                return <div onMouseDown={e => { this.onOpenFieldStat(e, f) }} className="h-30 f-14 flex-end flex-fixed  cursor item-hover visible-hover text-overflow" style={style} key={i}>
                    {!this.block.statFieldsList.loading && !sf && <span className="remark visible"><S>计算</S></span>}
                    {this.block.statFieldsList.loading && <span className="remark"><Spin></Spin></span>}
                    {sf && <>
                        <span className="gap-r-3 remark f-14 ">{si?.text}</span>
                        {rv()}
                    </>}
                </div>
            })}
            {(this.block).dataGridIsCanEdit() && <div style={{ minWidth: 40, flexGrow: 1, flexShrink: 1 }}></div>}
        </div>
    }
}


export class DataGridTableHead extends React.Component<{ block: Block, style?: CSSProperties }> {
    get block() {
        return this.props.block as TableStore
    }
    subline: HTMLElement;
    el: HTMLElement;
    isMoveLine: boolean = false;
    mouseleaveHead(event: React.MouseEvent) {
        if (this.isMoveLine) return;
        if (this.isDragMouseField) return;
        this.subline.style.display = 'none';
    }
    mousemove(event: MouseEvent) {
        if (!this.block.dataGridIsCanEdit()) return;
        if (this.isMoveLine) return;
        if (!this.block.schema) return;
        if (this.isDragMouseField) return;
        var head = (this.el as HTMLElement);
        if (!head) return;
        var tableHeadRect = Rect.fromEle(head);
        var tableLeft = tableHeadRect.left;
        var w = 0;
        var gap = 5;
        var index = -1;
        var headRect = Rect.fromEle(head);
        if (event.clientY > headRect.top && event.clientY < headRect.bottom) {
            var cs = Array.from(head.querySelectorAll('.sy-dg-table-head-th')) as HTMLElement[];
            for (let i = 0; i < cs.length; i++) {
                var th = cs[i];
                var thRect = Rect.fromEle(th);
                w += thRect.width;
                var bw = tableLeft + w;
                if (bw - gap < event.clientX && event.clientX < bw + gap) {
                    index = i;
                    break;
                }
            }
        }
        if (index > -1 && index < this.block.fields.length) {
            this.subline.style.display = 'block';
            this.subline.style.left = w + 'px';
            this.subline.style.height = tableHeadRect.height + 'px';
            this.subline.setAttribute('data-index', index.toString());
        }
        else {
            this.subline.style.display = 'none';
        }
    }
    onMousedownLine(event: React.MouseEvent) {
        if (!this.block.dataGridIsCanEdit()) return;
        if (this.isDragMouseField) return;
        var self = this;
        self.isMoveLine = true;
        event.stopPropagation();
        var head = self.el;
        var cs = Array.from(head.querySelectorAll('.sy-dg-table-head-th')) as HTMLElement[];
        var newFields = self.block.fields.map(f => f.clone());
        MouseDragger<{ colIndex: number, colWidth: number, colEles: HTMLElement[] }>({
            event,
            cursor: 'col-resize',
            moveStart: (ev, data) => {
                data.colIndex = parseInt(self.subline.getAttribute('data-index'));
                var rs = self.block.el.querySelectorAll('.sy-dg-table-row');
                var ths = self.block.el.querySelectorAll('.sy-dg-table-head');
                var cols: HTMLElement[] = [];
                ths.forEach(th => {
                    var tss = th.querySelectorAll('.sy-dg-table-head-th');
                    cols.push(tss[data.colIndex] as HTMLElement);
                })
                // cols.push(cs[data.colIndex] as HTMLElement)
                rs.forEach(r => {
                    var c = r.children[data.colIndex] as HTMLElement;
                    cols.push(c);
                })
                data.colEles = cols;
                data.colWidth = Rect.fromEle(cs[data.colIndex]).width;
            },
            moving: (ev, data, isend, isM) => {
                if (!isM) return;
                self.isMoveLine = true;
                var dx = ev.clientX - event.clientX;
                var w = dx + data.colWidth;
                w = Math.max(w, 50);
                if (data.colEles)
                    data.colEles.forEach(el => {
                        el.style.width = w + 'px';
                    })
                var left = cs.findAll((g, i) => i < data.colIndex).sum(g => Rect.fromEle(g).width) + w;
                self.subline.style.left = left + 'px';
                var tableHeadRect = Rect.fromEle(self.el);
                self.subline.style.height = (tableHeadRect.height) + 'px';
                if (isend) {
                    var col = newFields[data.colIndex];
                    col.colWidth = w;
                    self.isMoveLine = false;
                    self.subline.style.display = 'none';
                    self.block.onChangeFields(self.block.fields, newFields);
                }
            },
            moveEnd() {
                self.isMoveLine = false;
                self.subline.style.display = 'none';
            }
        })
    }
    private isDragMouseField: boolean = false;
    onDragMouseField(event: React.MouseEvent, vf: ViewField) {
        if (!this.block.dataGridIsCanEdit()) return;
        event.stopPropagation();
        var th = (event.target as HTMLElement).closest('.sy-dg-table-head-th') as HTMLElement;
        var parent = th.parentElement;
        var self = this;
        MouseDragger({
            event,
            moveStart: (ev, data) => {
                self.isDragMouseField = true;
                ghostView.load(th, { point: Point.from(ev), opacity: .9 });
                th.classList.add('dragging')
                th.style.pointerEvents = 'none';
            },
            move: (ev, data) => {
                ghostView.move(Point.from(ev));
                var ele = ev.target as HTMLElement;
                var overTh = ele.closest('.sy-dg-table-head-th') as HTMLElement;
                if (overTh && parent.contains(overTh) && !overTh.classList.contains('sy-dg-table-head-th-plus')) {
                    var rect = Rect.fromEle(overTh);
                    if (ev.pageX < rect.center) {
                        parent.insertBefore(th, overTh);
                    }
                    else {
                        var next = overTh.nextElementSibling;
                        if (next) parent.insertBefore(th, next)
                        else parent.appendChild(th)
                    }
                }
            },
            async moveEnd(ev, isMove) {
                if (isMove) {
                    self.isDragMouseField = false;
                    ghostView.unload()
                    th.classList.remove('dragging')
                    th.style.pointerEvents = 'auto';
                    var cs = Array.from(parent.querySelectorAll('.sy-dg-table-head-th'));
                    var b = th.previousElementSibling;
                    var at = -1;
                    if (b) at = cs.findIndex(g => g === b);
                    var vs = self.block.fields.map(c => c.clone());
                    vs.remove(v => v.isSame(vf));
                    if (at == -1) vs.splice(0, 0, vf.clone())
                    else vs.splice(at + 1, 0, vf.clone());
                    await self.block.onChangeFields(self.block.fields, vs);
                }
            }
        })
    }
    render() {
        return <div ref={e => this.el = e} style={{
            minWidth: this.block.sumWidth,
            ...(this.props.style || {})
        }} onMouseLeave={e => this.mouseleaveHead(e)} className="sy-dg-table-head relative" onMouseMove={e => this.mousemove(e.nativeEvent)}>
            <div className='sy-dg-table-subline' onMouseDown={e => this.onMousedownLine(e)} ref={e => this.subline = e}></div>
            {this.block.fields.map((f, i) => {
                var text = f.field?.text || f.text;
                var icon: IconValueType;
                if (f.type == 'check') icon = CheckSvg;
                else if (f.type == 'rowNum') { icon = undefined; }
                else if (f.field) icon = GetFieldTypeSvg(f.field);

                var style: CSSProperties = {
                    width: f.colWidth || 120
                }
                if (!this.block.dataGridIsCanEdit() && i == this.block.fields.length - 1) {
                    style = {
                        minWidth: f.colWidth || 120,
                        flexGrow: 1,
                        flexShrink: 1
                    }
                }
                return <div className="sy-dg-table-head-th  text-1 f-14" onMouseDown={e => this.onDragMouseField(e, f)}
                    style={style}
                    key={f.id + i.toString()}>
                    {icon && <div className={'sy-dg-table-head-th-icon remark flex-fixed size-16 flex-center gap-r-5 '} >
                        <Icon fontColorInherit icon={icon} size={16}></Icon>
                    </div>}
                    <label className="flex-auto">{text}</label>
                    {this.block.dataGridIsCanEdit() && <div className={'sy-dg-table-head-th-property remark item-light-hover round'} onMouseDown={async e => {
                        var ele = e.currentTarget as HTMLElement;
                        try {
                            ele.classList.add('hover');
                            await this.block.onOpenFieldConfig(e, f.field, f);
                        }
                        catch (ex) {

                        }
                        finally {
                            ele.classList.remove('hover');
                        }
                    }}><Icon icon={DotsSvg}></Icon></div>}
                </div>
            })}
            {this.block.dataGridIsCanEdit() && <div className='sy-dg-table-head-th sy-dg-table-head-th-plus'
                style={{ minWidth: 40, flexGrow: 1, flexShrink: 1 }}>
                <ToolTip overlay={lst('添加新列')}><span onMouseDown={e => { e.stopPropagation(); this.block.onAddField(Rect.fromEvent(e)) }} className="size-24 item-hover round cursor flex-center text-1"><Icon size={18} icon={PlusSvg}></Icon></span></ToolTip>
            </div>}
        </div>
    }
}