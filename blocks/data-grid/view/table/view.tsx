import React from "react"
import { TableStore } from "."
import { Icon } from "../../../../component/view/icon"
import { view } from "../../../../src/block/factory/observable"
import { BlockView } from "../../../../src/block/view"
import { ChildsArea } from "../../../../src/block/view/appear"
import { GetFieldTypeSvg } from "../../schema/util"
import { Point, Rect } from "../../../../src/common/vector/point"
import { MouseDragger } from "../../../../src/common/dragger"
import { DataGridTool } from "../components/tool"
import { CheckSvg, CollectTableSvg, DotsSvg, PlusSvg, TypesNumberSvg } from "../../../../component/svgs"
import { ghostView } from "../../../../src/common/ghost"
import { ViewField } from "../../schema/view"
import lodash from "lodash"
import { Spin, SpinBox } from "../../../../component/view/spin"

@view('/data-grid/table')
export class TableStoreView extends BlockView<TableStore>{
    mouseleaveHead(event: React.MouseEvent) {
        if (this.isMoveLine) return;
        if (this.isDragMouseField) return;
        this.subline.style.display = 'none';
    }
    mousemove(event: MouseEvent) {
        if (this.isMoveLine) return;
        if (!this.block.schema) return;
        if (this.isDragMouseField) return;
        var box = (this.block.el as HTMLElement).querySelector('.sy-dg-table-content') as HTMLElement;
        var head = box.querySelector('.sy-dg-table-head') as HTMLElement;
        if (!head) return;
        var boxRect = Rect.fromEle(box);
        var tableHeadRect = Rect.fromEle(head);
        var scrollLeft = box.scrollLeft;
        var tableLeft = boxRect.left - scrollLeft;
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
        if (index > -1) {
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
        if (!this.block.isCanEdit()) return;
        if (this.isDragMouseField) return;
        var self = this;
        self.isMoveLine = true;
        event.stopPropagation();
        var oldFields = this.block.fields.map(f => {
            if (typeof f.get == 'function') return f.get()
            else return lodash.cloneDeep(f)
        });
        var head = self.block.el.querySelector('.sy-dg-table-head');
        var cs = Array.from(head.querySelectorAll('.sy-dg-table-head-th')) as HTMLElement[];
        MouseDragger<{ colIndex: number, colWidth: number, colEles: HTMLElement[] }>({
            event,
            cursor: 'col-resize',
            moveStart: (ev, data) => {
                data.colIndex = parseInt(self.subline.getAttribute('data-index'));
                var rs = self.block.el.querySelectorAll('.sy-dg-table-row');
                var cols: HTMLElement[] = [];
                cols.push(cs[data.colIndex] as HTMLElement)
                rs.forEach(r => {
                    var c = r.children[data.colIndex] as HTMLElement;
                    cols.push(c);
                })
                data.colEles = cols;
                data.colWidth = Rect.fromEle(cs[data.colIndex]).width;
            },
            moving: (ev, data, isend) => {
                self.isMoveLine = true;
                var dx = ev.clientX - event.clientX;
                var w = dx + data.colWidth;
                w = Math.max(w, 50);
                data.colEles.forEach(el => {
                    el.style.width = w + 'px';
                })
                var left = cs.findAll((g, i) => i < data.colIndex).sum(g => Rect.fromEle(g).width) + w;
                self.subline.style.left = left + 'px';
                var tableHeadRect = Rect.fromEle(self.block.el.querySelector('.sy-dg-table-head') as HTMLElement);
                self.subline.style.height = (tableHeadRect.height) + 'px';
                if (isend) {
                    var newFields = self.block.fields.map(f => f.clone());
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
        if (!this.block.isCanEdit()) return;
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
            moving: (ev, data, isend) => {
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
            moveEnd(ev, isMove) {
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
                    self.block.onChangeFields(self.block.fields, vs);
                }
            }
        })
    }
    subline: HTMLElement;
    isMoveLine: boolean = false;
    renderHead() {
        return <div style={{ minWidth: this.block.sumWidth }} onMouseLeave={e => this.mouseleaveHead(e)} className="sy-dg-table-head" onMouseMove={e => this.mousemove(e.nativeEvent)}>
            <div className='sy-dg-table-subline' onMouseDown={e => this.onMousedownLine(e)} ref={e => this.subline = e}></div>
            {this.block.fields.map((f, i) => {
                var icon: SvgrComponent | JSX.Element;
                if (f.type == 'check') icon = CheckSvg;
                else if (f.type == 'rowNum') icon = TypesNumberSvg;
                else if (f.field) icon = GetFieldTypeSvg(f.field.type);
                return <div className="sy-dg-table-head-th f-14 text-1" onMouseDown={e => this.onDragMouseField(e, f)}
                    style={{ width: f.colWidth || 120 }}
                    key={f?.field?.id || i}>
                    <div className={'sy-dg-table-head-th-icon flex-fix size-24 flex-center text-1'} >
                        <Icon icon={icon} size={16}></Icon>
                    </div>
                    <label>{f.field?.text || f.text}</label>
                    {this.block.isCanEdit() && <div className={'sy-dg-table-head-th-property'} onMouseDown={e => this.block.onOpenFieldConfig(e, f)}><Icon icon={DotsSvg}></Icon></div>}
                </div>
            })}
            {this.block.isCanEdit() && <div className='sy-dg-table-head-th sy-dg-table-head-th-plus'
                style={{ minWidth: 40, flexGrow: 1, flexShrink: 1 }} onMouseDown={e => { e.stopPropagation(); this.block.onAddField(Rect.fromEvent(e)) }}>
                <Icon icon={PlusSvg}></Icon>
            </div>}
        </div>
    }
    renderBody() {
        var self = this;
        if (this.block.data) {
            var ids = this.block.childs.map(c => c.id)
            return <SpinBox spin={this.block.isLoadingData}><div className='sy-dg-table-body'>
                <ChildsArea childs={this.block.childs}></ChildsArea>
                {this.block.isCanEdit() && <div
                    style={{ width: this.block.sumWidth + 'px' }}
                    onMouseDown={e => { e.stopPropagation(); self.block.onAddRow({}, undefined, 'after') }}
                    className="sy-dg-table-add">
                    <span className="flex flex-inline cursor item-hover round padding-w-5">
                        <span className="size-24 round flex-center "><Icon size={18} icon={PlusSvg}></Icon></span>
                        <span className="f-14">新增</span>
                    </span>
                </div>}
            </div></SpinBox>
        }
        else return <Spin block></Spin>
    }
    renderCreateTable() {
        return !this.block.schema && this.block.isCanEdit() && <div className="item-hover item-hover-focus cursor round flex" onClick={e => this.block.onCreateTableSchema()}>
            <span className="size-24 flex-center remark"><Icon size={16} icon={CollectTableSvg}></Icon></span>
            <span className="remark">创建数据表格</span>
        </div>
    }
    render() {
        var self = this;
        return <div className={"sy-dg-table" +
            (this.block.noBorder ? " sy-dg-table-no-border" : "") +
            (this.block.noHead ? " sy-dg-table-no-header" : "")
        }
            onMouseEnter={e => this.block.onOver(true)}
            onMouseLeave={e => this.block.onOver(false)}
        >
            {this.block.schema && <DataGridTool block={this.block}></DataGridTool>}
            {this.block.schema && <div className="sy-dg-table-content" >
                {this.block.noHead !== true && this.renderHead()}
                {this.renderBody()}
            </div>}
            {this.renderCreateTable()}
        </div>
    }
}