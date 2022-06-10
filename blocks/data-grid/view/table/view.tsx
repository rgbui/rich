import React from "react"
import { TableStore } from "."
import { Icon } from "../../../../component/view/icon"
import { view } from "../../../../src/block/factory/observable"
import { BlockView } from "../../../../src/block/view"
import { ChildsArea } from "../../../../src/block/view/appear"
import { getTypeSvg } from "../../schema/util"
import { Loading } from "../../../../component/view/loading"
import { Point, Rect } from "../../../../src/common/vector/point"
import { MouseDragger } from "../../../../src/common/dragger"
import { DataGridTool } from "../components/tool"
import { BlockRenderRange } from "../../../../src/block/enum"
import { CheckSvg, PlusSvg, TypesNumberSvg } from "../../../../component/svgs"
import { ghostView } from "../../../../src/common/ghost"
import { ViewField } from "../../schema/view"
import lodash from "lodash"

@view('/data-grid/table')
export class TableStoreView extends BlockView<TableStore>{
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
            for (let i = 0; i < this.block.fields.length; i++) {
                var col = this.block.fields[i];
                w += col.colWidth;
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
        if (this.isDragMouseField) return;
        var self = this;
        self.isMoveLine = true;
        event.stopPropagation();
        var oldFields = this.block.fields.map(f => {
            if (typeof f.get == 'function') return f.get()
            else return lodash.cloneDeep(f)
        });
        MouseDragger<{ colIndex: number, colWidth: number, colEles: HTMLElement[] }>({
            event,
            cursor: 'col-resize',
            moveStart: (ev, data) => {
                data.colIndex = parseInt(self.subline.getAttribute('data-index'));
                var rs = self.block.el.querySelectorAll('.sy-dg-table-row');
                var cols: HTMLElement[] = [];
                var head = self.block.el.querySelector('.sy-dg-table-head');
                var cs = Array.from(head.querySelectorAll('.sy-dg-table-head-th'));
                cols.push(cs[data.colIndex] as HTMLElement)
                rs.forEach(r => {
                    var c = r.children[data.colIndex] as HTMLElement;
                    cols.push(c);
                })
                data.colEles = cols;
                data.colWidth = this.block.fields[data.colIndex].colWidth;
            },
            moving: (ev, data, isend) => {
                self.isMoveLine = true;
                var dx = ev.clientX - event.clientX;
                var w = dx + data.colWidth;
                w = Math.max(w, 50);
                data.colEles.forEach(el => {
                    el.style.width = w + 'px';
                })
                var left = this.block.fields.findAll((g, i) => i < data.colIndex).sum(g => g.colWidth) + w + 1;
                self.subline.style.left = left + 'px';
                var tableHeadRect = Rect.fromEle(self.block.el.querySelector('.sy-dg-table-head') as HTMLElement);
                self.subline.style.height = (tableHeadRect.height) + 'px';
                if (isend) {
                    var cols = self.block.fields;
                    var col = cols[data.colIndex];
                    col.colWidth = w;
                    var newFields = self.block.fields.map(f => f.get());
                    self.block.onManualUpdateProps({ fields: oldFields }, { fields: newFields }, BlockRenderRange.none, true)
                }
            },
            moveEnd() {
                self.isMoveLine = false;
            }
        })
    }
    private isDragMouseField: boolean = false;
    onDragMouseField(event: React.MouseEvent, vf: ViewField) {
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
        return <div className="sy-dg-table-head" onMouseMove={e => this.mousemove(e.nativeEvent)}>
            <div className='sy-dg-table-subline' onMouseDown={e => this.onMousedownLine(e)} ref={e => this.subline = e}></div>
            {this.block.fields.map((f, i) => {
                var icon: SvgrComponent | JSX.Element;
                if (f.type == 'check') icon = CheckSvg;
                else if (f.type == 'rowNum') icon = TypesNumberSvg;
                else if (f.field) icon = getTypeSvg(f.field.type);
                return <div className="sy-dg-table-head-th" onMouseDown={e => this.onDragMouseField(e, f)}
                    style={{ width: f.colWidth || 120 }}
                    key={f?.field?.id || i}>
                    <div className={'sy-dg-table-head-th-icon'} ><Icon icon={icon} size='none'></Icon></div>
                    <label>{f.text || f.field?.text}</label>
                    <div className={'sy-dg-table-head-th-property'} onMouseDown={e => this.block.onOpenConfigField(e, f)}><Icon icon='elipsis:sy'></Icon></div>
                </div>
            })}
            <div className='sy-dg-table-head-th sy-dg-table-head-th-plus'
                style={{ minWidth: 40, flexGrow: 1, flexShrink: 1 }} onMouseDown={e => this.block.onAddField(e)}>
                <Icon icon={PlusSvg}></Icon>
            </div>
        </div>
    }
    renderBody() {
        var self = this;
        if (this.block.data && this.block.isLoadData) {
            var ids = this.block.childs.map(c => c.id)
            return <div className='sy-dg-table-body'>
                <ChildsArea childs={this.block.childs}></ChildsArea>
                {!this.block.isLock && <div
                    style={{ width: (this.block.fields.sum(c => c.colWidth) + 40) + 'px' }}
                    onMouseDown={e => { e.stopPropagation(); self.block.onAddRow({}, undefined, 'after') }}
                    className="sy-dg-table-add">
                    <Icon size={12} icon={PlusSvg}></Icon><span>新增</span>
                </div>}
            </div>
        }
        else return <div><Loading></Loading></div>
    }
    renderCreateTable() {
        return !this.block.schema && <div>
            <a onClick={e => this.block.createTableSchema()}>创建表格</a>
        </div>
    }
    render() {
        var self = this;
        return <div className="sy-dg-table"
            onMouseEnter={e => this.block.onOver(true)}
            onMouseLeave={e => this.block.onOver(false)}
        >
            <DataGridTool block={this.block}></DataGridTool>
            {this.block.schema && <div className="sy-dg-table-content" >
                {this.renderHead()}
                {this.renderBody()}

            </div>}
            {this.renderCreateTable()}
        </div>
    }
}