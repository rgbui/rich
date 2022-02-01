import React from "react"
import { TableStore } from "."
import { Icon } from "../../../../component/view/icon"
import { view } from "../../../../src/block/factory/observable"
import { BlockView } from "../../../../src/block/view"
import { ChildsArea } from "../../../../src/block/view/appear"
import Plus from "../../../../src/assert/svg/plus.svg";
import { getTypeSvg } from "../../schema/util"
import { Loading } from "../../../../component/view/loading"
import { Rect } from "../../../../src/common/vector/point"
import { MouseDragger } from "../../../../src/common/dragger"

@view('/data-grid/table')
export class TableStoreView extends BlockView<TableStore>{
    mousemove(event: MouseEvent) {
        if (this.isMoveLine) return;
        var box = this.block.el as HTMLElement;
        var boxRect = Rect.fromEle(box);
        var tableRect = Rect.fromEle(box.querySelector('.sy-dg-table-body'));
        var tableHeadRect = Rect.fromEle(box.querySelector('.sy-dg-table-head'));
        var scrollLeft = box.scrollLeft;
        var tableLeft = boxRect.left - scrollLeft;
        var w = 0;
        var gap = 5;
        var index = -1;
        for (let i = 0; i < this.block.fields.length; i++) {
            var col = this.block.fields[i];
            w += col.colWidth;
            var bw = tableLeft + w;
            if (bw - gap < event.clientX && event.clientX < bw + gap) {
                index = i;
                break;
            }
        }
        if (index > -1) {
            this.subline.style.display = 'block';
            this.subline.style.left = (w + 1) + 'px';
            this.subline.style.height = (tableHeadRect.height + tableRect.height) + 'px';
            this.subline.setAttribute('data-index', index.toString());
        }
        else {
            this.subline.style.display = 'none';
        }
    }
    onMousedownLine(event: React.MouseEvent) {
        var self = this;
        self.isMoveLine = true;
        event.stopPropagation();
        MouseDragger<{ colIndex: number, colWidth: number, colEles: HTMLElement[] }>({
            event,
            cursor: 'col-resize',
            moveStart: (ev, data) => {
                data.colIndex = parseInt(self.subline.getAttribute('data-index'));
                var rs = self.block.el.querySelectorAll('.sy-dg-table-row');
                var cols: HTMLElement[] = [];
                var head = self.block.el.querySelector('.sy-dg-table-head');
                cols.push(head.children[data.colIndex] as HTMLElement)
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
                var tableRect = Rect.fromEle(self.block.el.querySelector('.sy-dg-table-body'));
                var tableHeadRect = Rect.fromEle(self.block.el.querySelector('.sy-dg-table-head'));
                self.subline.style.height = (tableRect.height + tableHeadRect.height) + 'px';
                if (isend) {
                    var cols = self.block.fields;
                    var col = cols[data.colIndex];
                    col.colWidth = w;
                    //self.block.updateArrayInsert()
                    // self.block.onUpdateProps({ cols })
                }
            },
            moveEnd() {
                self.isMoveLine = false;
            }
        })
    }
    subline: HTMLElement;
    private isMoveLine: boolean = false;
    renderHead() {
        return <div className="sy-dg-table-head">
            {this.block.fields.map(f => {
                return <div className="sy-dg-table-head-th"
                    style={{ width: f.colWidth || 120 }}
                    key={f.field.name}>
                    <div className={'sy-dg-table-head-th-icon'} ><Icon icon={getTypeSvg(f.field.type)} size='none'></Icon></div>
                    <label>{f.text || f.field.text}</label>
                    <div className={'sy-dg-table-head-th-property'} onMouseDown={e => this.block.openConfigField(e, f)}><Icon icon='elipsis:sy'></Icon></div>
                </div>
            })}
            <div className='sy-dg-table-head-th sy-dg-table-head-th-plus'
                style={{ width: 40 }} onMouseDown={e => this.block.onAddField(e)}>
                <Icon icon={Plus}></Icon>
            </div>
        </div>
    }
    renderBody() {
        if (this.block.data && this.block.isLoadData) {
            return <div className='sy-dg-table-body'>
                <ChildsArea childs={this.block.childs}></ChildsArea>
            </div>
        }
        else return <div><Loading></Loading></div>
    }
    renderCreateTable() {
        return !this.block.schema && <div>
            <a onClick={e => this.block.didMounted()}>创建表格</a>
        </div>
    }
    render() {
        var self = this;
        return <div className="sy-dg-table" onMouseMove={e => this.mousemove(e.nativeEvent)}>
            <div className='sy-block-table-subline' onMouseDown={e => this.onMousedownLine(e)} ref={e => this.subline = e}></div>
            {this.block.schema && <div className="sy-dg-table-content" >
                {this.renderHead()}
                {this.renderBody()}
                <div onMouseDown={e => { e.stopPropagation(); self.block.onAddRow({}, undefined, 'after') }}
                    className="sy-dg-table-add" style={{ width: this.block.fields.sum(s => s.colWidth) + 40 }}>
                    <Icon size={12} icon={Plus}></Icon><span>新增</span>
                </div>
            </div>}
            {this.renderCreateTable()}
        </div>
    }
}