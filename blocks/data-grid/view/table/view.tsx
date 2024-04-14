import React, { CSSProperties } from "react"
import { TableStore } from "."
import { Icon, IconValueType } from "../../../../component/view/icon"
import { view } from "../../../../src/block/factory/observable"
import { BlockView } from "../../../../src/block/view"
import { ChildsArea } from "../../../../src/block/view/appear"
import { GetFieldTypeSvg } from "../../schema/util"
import { Point, Rect } from "../../../../src/common/vector/point"
import { MouseDragger } from "../../../../src/common/dragger"
import { DataGridTool } from "../components/tool"
import { CheckSvg, CollectTableSvg, DotsSvg, PlusSvg } from "../../../../component/svgs"
import { ghostView } from "../../../../src/common/ghost"
import { ViewField } from "../../schema/view"
import { Spin, SpinBox } from "../../../../component/view/spin"
import { ToolTip } from "../../../../component/view/tooltip"
import { lst } from "../../../../i18n/store"
import { S } from "../../../../i18n/view"

@view('/data-grid/table')
export class TableStoreView extends BlockView<TableStore> {
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
        var box = (this.block.el as HTMLElement).querySelector('.sy-dg-table-content') as HTMLElement;
        var head = (this.block.el as HTMLElement).querySelector('.sy-dg-table-head') as HTMLElement;
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
        if (!this.block.dataGridIsCanEdit()) return;
        if (this.isDragMouseField) return;
        var self = this;
        self.isMoveLine = true;
        event.stopPropagation();
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
    headEl: HTMLElement;
    headScrollEl: HTMLElement;
    renderHead() {
        return <div className="h-36"><div style={{
            minWidth: this.block.sumWidth
        }} ref={e => this.headEl = e} onMouseLeave={e => this.mouseleaveHead(e)} className="sy-dg-table-head" onMouseMove={e => this.mousemove(e.nativeEvent)}>
            <div className='sy-dg-table-subline' onMouseDown={e => this.onMousedownLine(e)} ref={e => this.subline = e}></div>
            {this.block.fields.map((f, i) => {
                var text = f.field?.text || f.text;
                var icon: IconValueType;
                if (f.type == 'check') icon = CheckSvg;
                else if (f.type == 'rowNum') { icon = undefined; }
                else if (f.field) icon = GetFieldTypeSvg(f.field.type);
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
                    key={f?.field?.id || i}>
                    {icon && <div className={'sy-dg-table-head-th-icon remark flex-fix size-16 flex-center gap-r-5 '} >
                        <Icon icon={icon} size={16}></Icon>
                    </div>}
                    <label>{text}</label>
                    {this.block.dataGridIsCanEdit() && <div className={'sy-dg-table-head-th-property remark'} onMouseDown={e => this.block.onOpenFieldConfig(e, f)}><Icon icon={DotsSvg}></Icon></div>}
                </div>
            })}
            {this.block.dataGridIsCanEdit() && <div className='sy-dg-table-head-th sy-dg-table-head-th-plus'
                style={{ minWidth: 40, flexGrow: 1, flexShrink: 1 }}>
                <ToolTip overlay={lst('添加新列')}><span onMouseDown={e => { e.stopPropagation(); this.block.onAddField(Rect.fromEvent(e)) }} className="size-24 item-hover round cursor flex-center text-1"><Icon icon={PlusSvg}></Icon></span></ToolTip>
            </div>}
        </div>
        </div>
    }
    renderBody() {
        var self = this;
        if (this.block.data) {
            return <SpinBox spin={this.block.isLoadingData}><div className='sy-dg-table-body'>
                <ChildsArea childs={this.block.childs}></ChildsArea>
                {this.block.isCanAddRow() && <div
                    style={{ width: this.block.sumWidth + 'px' }}
                    onMouseDown={e => { e.stopPropagation(); self.block.onSyncAddRow({}, undefined, 'after') }}
                    className="sy-dg-table-add">
                    <ToolTip overlay={lst('添加新行')}><span className="flex flex-inline cursor item-hover round padding-w-5">
                        <span className="size-24 round flex-center "><Icon size={18} icon={PlusSvg}></Icon></span>
                        <span className="f-14"><S>新增</S></span>
                    </span></ToolTip>
                </div>}
            </div></SpinBox>
        }
        else return <Spin block></Spin>
    }
    renderCreateTable() {
        if (this.block.isLoading) return <></>
        if (this.block.isLoadingData) return <></>
        return !this.block.schema && this.block.isCanEdit() && <div className="item-hover item-hover-focus padding-h-5 padding-w-10 cursor round flex" onClick={e => this.block.onCreateTableSchema()}>
            {this.block.willCreateSchema && <Spin></Spin>}
            {!this.block.willCreateSchema && <> <span className="size-24 flex-center remark"><Icon size={16} icon={CollectTableSvg}></Icon></span>
                <span className="remark"><S>创建数据表格</S></span></>}
        </div>
    }
    renderView() {
        return <div className={"sy-dg-table" +
            (this.block.noBorder ? " sy-dg-table-no-border" : "") +
            (this.block.noHead ? " sy-dg-table-no-header" : "")
        }
            onMouseEnter={e => this.block.onOver(true)}
            onMouseLeave={e => this.block.onOver(false)}
        >
            {this.block.isLoading && <Spin block></Spin>}
            {this.block.schema && <DataGridTool block={this.block}></DataGridTool>}
            {this.block.schema && this.block.noHead !== true && <div
                ref={e => { this.headScrollEl = e; this.bindScroll() }}
                className="scroll-hidden"
                style={{
                    overflowX: 'auto',
                    zIndex: 1,
                    position: 'sticky',
                    top: 0,
                    display: 'none'
                }}>
            </div>}
            <div className="sy-dg-table-content" >
                {this.block.schema && this.block.noHead !== true && this.renderHead()}
                {this.block.schema && this.renderBody()}
            </div>
            {this.renderCreateTable()}
        </div>
    }
    async didMount() {
        var sd = this.props.block.page.getScrollDiv() as HTMLElement;
        if (sd) sd.addEventListener('scroll', this._scroll)
        var box = this.block.el.querySelector('.sy-dg-table-content');
        if (box) {
            box.addEventListener('scroll', this.content_scroll);
        }
    }
    bindScroll() {
        if (this.headScrollEl) {
            this.headScrollEl.removeEventListener('scroll', this.head_scroll);
            this.headScrollEl.addEventListener('scroll', this.head_scroll);
        }
    }
    willUnmount() {
        var sd = this.props.block.page.getScrollDiv() as HTMLElement;
        if (sd) sd.removeEventListener('scroll', this._scroll);
        var box = this.block.el.querySelector('.sy-dg-table-content');
        if (box) {
            box.removeEventListener('scroll', this.content_scroll);
        }
        if (this.headScrollEl) {
            this.headScrollEl.removeEventListener('scroll', this.head_scroll);
        }
    }
    _scroll = (e) => {
        if (this.block.schema && this.block.noHead != true) {
            var div = this.props.block.page.getScrollDiv() as HTMLElement;
            if (div) {
                var el = this.block.el;
                var eb = Rect.fromEle(el);
                var db = Rect.fromEle(div);
                if (db.top > eb.top && db.top < eb.bottom) {
                    this.headScrollEl.style.display = 'block'
                    this.headScrollEl.appendChild(this.headEl);
                    var box = this.block.el.querySelector('.sy-dg-table-content');
                    if (box)
                        this.headScrollEl.scrollLeft = box.scrollLeft;
                    this.headEl.style.backgroundColor = '#fff';
                }
                else {
                    this.headScrollEl.style.display = 'none';
                    this.headEl.style.backgroundColor = 'none';
                    this.block.el.querySelector('.h-36').appendChild(this.headEl);
                }
            }
        }
    }
    content_scroll = (e) => {
        var box = this.block.el.querySelector('.sy-dg-table-content');
        if (box) {
            this.headScrollEl.scrollLeft = box.scrollLeft;
        }
    }
    head_scroll = (e) => {
        var box = this.block.el.querySelector('.sy-dg-table-content');
        if (box) {

            box.scrollLeft = this.headScrollEl.scrollLeft;
        }
    }
}