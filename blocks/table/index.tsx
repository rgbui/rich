import { Block } from "../../src/block";
import { BlockView } from "../../src/block/view";
import React from "react";
import { prop, url, view } from "../../src/block/factory/observable";
import "./style.less";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { ChildsArea } from "../../src/block/view/appear";
import { ActionDirective } from "../../src/history/declare";
import { Point, Rect } from "../../src/common/vector/point";
import lodash from 'lodash';
import { MouseDragger } from "../../src/common/dragger";
import { PlusSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { ghostView } from "../../src/common/ghost";

const COL_WIDTH = 150;
const CELL_HEIGHT = 30;

@url('/table')
export class Table extends Block {
    display = BlockDisplay.block;
    @prop()
    cols: { width: number }[] = [];
    async created() {
        await this.updateProps({ cols: [{ width: COL_WIDTH }, { width: COL_WIDTH }] });
        await this.page.createBlock('/table/row',
            { blocks: { childs: [{ url: '/table/cell' }, { url: '/table/cell' }] } },
            this);
        await this.page.createBlock('/table/row',
            { blocks: { childs: [{ url: '/table/cell' }, { url: '/table/cell' }] } },
            this);
        await this.page.createBlock('/table/row',
            { blocks: { childs: [{ url: '/table/cell' }, { url: '/table/cell' }] } },
            this);
    }
    async didMounted() {
        if (this.childs.length == 0) {
            this.page.onAction(ActionDirective.onErrorRepairDidMounte, async () => {
                await this.updateProps({ cols: [{ width: COL_WIDTH }] });
                await this.page.createBlock('/table/row',
                    { blocks: { childs: [{ url: '/table/cell' }] } },
                    this);
                await this.page.createBlock('/table/row',
                    { blocks: { childs: [{ url: '/table/cell' }] } },
                    this);
                await this.page.createBlock('/table/row',
                    { blocks: { childs: [{ url: '/table/cell' }] } },
                    this);
            })
        }
    }
    async onAddRow(at?: number, arrow?: 'down' | 'up', isMerge?: boolean) {
        if (typeof at == 'undefined') at = this.childs.length;
        if (typeof arrow == 'undefined') arrow = 'up';
        await this.page.onAction('onAddRow', async () => {
            var cs = this.cols.map(c => {
                return {
                    url: '/table/cell'
                }
            })
            await this.page.createBlock('/table/row', { blocks: { childs: cs } }, this, at + (arrow == 'down' ? 1 : 0));
            if (isMerge) this.page.snapshoot.merge();
        });
    }
    async onAddColumn(at?: number, arrow?: 'left' | 'right', isMerge?: boolean) {
        if (typeof at == 'undefined') at = this.cols.length;
        if (typeof arrow == 'undefined') arrow = 'left';
        await this.page.onAction('onAddRow', async () => {
            var cs = lodash.cloneDeep(this.cols);
            cs.splice(at + (arrow == 'right' ? 1 : 0), 0, { width: COL_WIDTH });
            await this.updateProps({ cols: cs }, BlockRenderRange.self);
            await this.childs.eachAsync(async (row) => {
                await row.page.createBlock('/table/cell', {}, row, at + (arrow == 'right' ? 1 : 0));
            });
            if (isMerge) this.page.snapshoot.merge()
        });
    }
    async onDragAdd(options: { save?: boolean, row: number, column: number, newRow: number, newColumn: number }) {
        this.page.onAction('onDragAdd', async () => {
            this.page.snapshoot.pause();
            var ds: Block[] = [];
            await this.childs.eachReverseAsync(async (b, r) => {
                await b.childs.eachReverseAsync(async (g, c) => {
                    if (c >= options.column) ds.push(g);
                });
                if (r >= options.row) ds.push(b)
            });
            await ds.eachAsync(async b => await b.delete());
            if (this.cols.length < options.column) {
                for (let c = this.cols.length; c < options.column; c++) {
                    this.cols.push({ width: COL_WIDTH })
                }
            }
            else if (this.cols.length > options.column) {
                this.cols.splice(options.column, this.cols.length - options.column);
            }
            await this.childs.eachAsync(async row => {
                if (row.childs.length < options.column) {
                    for (let i = row.childs.length; i < options.column; i++) {
                        await row.page.createBlock('/table/cell', {}, row, i);
                    }
                }
            });
            if (this.childs.length < options.row) {
                for (let m = this.childs.length; m < options.row; m++) {
                    var cs = this.cols.map(c => {
                        return {
                            url: '/table/cell'
                        }
                    })
                    await this.page.createBlock('/table/row', { blocks: { childs: cs } }, this, m);
                }
            }
            /**
             * 做一些清理的准备
             */
            this.page.snapshoot.start();
            /**
             * 判断是否保存
             */
            if (options.save !== true) this.page.snapshoot.pause();
            var rs: Block[] = [];
            await this.childs.eachAsync(async (b, r) => {
                await b.childs.eachAsync(async (g, c) => {
                    if (c >= options.newColumn) rs.push(g);
                });
                if (r >= options.newRow) rs.push(b)
            });
            await rs.eachAsync(async b => await b.delete());
            var cols = lodash.cloneDeep(this.cols);
            if (cols.length < options.newColumn) {
                for (let c = cols.length; c < options.newColumn; c++) {
                    cols.push({ width: COL_WIDTH })
                }
            }
            else if (cols.length > options.newColumn) {
                cols.splice(options.newColumn, cols.length - options.newColumn);
            }
            await this.childs.eachAsync(async row => {
                if (row.childs.length < options.newColumn) {
                    for (let i = row.childs.length; i < options.newColumn; i++) {
                        await row.page.createBlock('/table/cell', {}, row, i);
                    }
                }
            });
            if (this.childs.length < options.newRow) {
                for (let m = this.childs.length; m < options.newRow; m++) {
                    var cs = cols.map(c => {
                        return {
                            url: '/table/cell'
                        }
                    })
                    await this.page.createBlock('/table/row', { blocks: { childs: cs } }, this, m);
                }
            };
            this.manualUpdateProps({ cols: this.cols }, { cols });
        });
    }
    async onChangeRowIndex(rowIndx: number, newRowIndex: number) {
        this.page.onAction('onChangeRowIndex', async () => {
            var row = this.childs[rowIndx];
            var newRow = this.childs[newRowIndex];
            if (newRow) await row.insertBefore(newRow);
            else await row.insertAfter(this.childs.last());
        });
    }
    async onChangeColumnIndex(columnIndex: number, newColumnIndex: number) {
        this.page.onAction('onChangeColumnIndex', async () => {
            var cs = lodash.cloneDeep(this.cols);
            await this.childs.eachAsync(async row => {
                var c = row.childs[columnIndex];
                var nc = row.childs[newColumnIndex];
                if (nc) await c.insertBefore(nc)
                else await c.insertAfter(row.childs.last())
            });
            var oc = cs[columnIndex];
            var cc = cs[newColumnIndex];
            if (cc) {
                cs.remove(g => g === oc);
                var at = cs.findIndex(g => g == cc);
                cs.splice(at, 0, oc);
            }
            else {
                cs.remove(g => g === oc);
                cs.push(oc);
            }
            this.manualUpdateProps({ cols: this.cols }, { cols: cs }, BlockRenderRange.self)
        });
    }
    async onRemoveColumn(columnIndex: number) {
        this.page.onAction('table.columnIndex', async () => {
            var cs = lodash.cloneDeep(this.cols);
            cs.splice(columnIndex, 1);
            var rows = this.childs;
            await rows.eachReverseAsync(async (row) => {
                await row.childs[columnIndex].delete()
            });
            this.manualUpdateProps({ cols: this.cols }, { cols: cs }, BlockRenderRange.self)
        })
    }
}
@view('/table')
export class TableView extends BlockView<Table>{
    mousemove(event: MouseEvent) {
        if (this.isMoveLine) return;
        var boxRect = Rect.fromEle(this.box);
        var tableRect = Rect.fromEle(this.table);
        var scrollLeft = this.box.scrollLeft;
        var tableLeft = boxRect.left - scrollLeft;
        var w = 5;
        var gap = 5;
        var index = -1;
        for (let i = 0; i < this.block.cols.length; i++) {
            var col = this.block.cols[i];
            w += col.width;
            var bw = tableLeft + w;
            if (bw - gap < event.clientX && event.clientX < bw + gap) {
                index = i;
                break;
            }
        }
        if (index > -1) {
            this.subline.style.display = 'block';
            this.subline.style.left = (w + 1) + 'px';
            this.subline.style.height = tableRect.height + 'px';
            this.subline.setAttribute('data-index', index.toString());
        }
        else {
            this.subline.style.display = 'none';
        }
        if (
            event.clientY >= tableRect.top && event.clientY <= tableRect.bottom
            &&
            event.clientX >= tableRect.right && event.clientX <= tableRect.right + 20
        ) {
            this.rightPlus.style.display = 'flex';
            this.rightPlus.style.left = (tableRect.width + 5) + 'px';
            this.rightPlus.style.height = tableRect.height + 'px';
        }
        else {
            this.rightPlus.style.display = 'none';
        }
        if (
            event.clientY >= tableRect.bottom && event.clientY <= tableRect.bottom + 20
            &&
            event.clientX >= tableRect.left && event.clientX <= tableRect.right
        ) {
            this.bottomPlus.style.display = 'flex';
            this.bottomPlus.style.top = (tableRect.height + 5) + 'px';
            this.bottomPlus.style.width = tableRect.width + 'px';
        }
        else {
            this.bottomPlus.style.display = 'none';
        }
        if (
            event.clientY >= tableRect.bottom && event.clientY <= tableRect.bottom + 20
            &&
            event.clientX >= tableRect.right && event.clientX <= tableRect.right + 20
        ) {
            this.resizePlus.style.display = 'flex';
            this.resizePlus.style.top = (tableRect.height + 5) + 'px';
            this.resizePlus.style.left = (tableRect.width + 5) + 'px';
        }
        else {
            this.resizePlus.style.display = 'none';
        }
        var isShowDragRow: boolean = false;
        var trs = Array.from(this.table.querySelector('tbody').children);
        for (let s = 0; s < trs.length; s++) {
            var tr = trs[s] as HTMLElement;
            var trRect = Rect.fromEle(tr);
            if (event.clientY >= trRect.top && event.clientY <= trRect.bottom) {
                var td = tr.children[0];
                var tdRect = Rect.fromEle(td as HTMLElement);
                if (event.clientX <= tableLeft + tdRect.width) {
                    var trRect = Rect.fromEle(tr);
                    this.leftDrag.style.display = 'flex';
                    this.leftDrag.style.top = (trRect.top - boxRect.top) + 'px';
                    this.leftDrag.style.height = trRect.height + 'px';
                    this.leftDrag.setAttribute('data-index', s.toString());
                    isShowDragRow = true;
                }
                break;
            }
        }
        if (!isShowDragRow) this.leftDrag.style.display = 'none';
        var isShowDragColumn: boolean = false;
        var cw = tableLeft + 5;
        var firstRow = trs[0];
        var firstRowRect = Rect.fromEle(firstRow as HTMLElement);
        if (event.clientY <= firstRowRect.bottom) {
            for (let i = 0; i < this.block.cols.length; i++) {
                var col = this.block.cols[i];
                if (event.clientX > cw && event.clientX <= cw + col.width) {
                    this.topDrag.style.display = 'flex';
                    this.topDrag.style.left = (cw - tableLeft) + 'px';
                    this.topDrag.style.width = col.width + 'px';
                    this.topDrag.setAttribute('data-index', i.toString());
                    isShowDragColumn = true;
                    break;
                }
                cw += col.width;
            }
        }
        if (!isShowDragColumn) {
            this.topDrag.style.display = 'none';
        }
    }
    onMousedownLine(event: React.MouseEvent) {
        this.topDrag.style.display = 'none';
        this.leftDrag.style.display = 'none';
        var self = this;
        self.isMoveLine = true;
        event.stopPropagation();
        MouseDragger<{ colIndex: number, colWidth: number, colEle: HTMLElement }>({
            event,
            cursor: 'col-resize',
            moveStart: (ev, data) => {
                data.colIndex = parseInt(self.subline.getAttribute('data-index'));
                data.colEle = self.table.querySelector('colgroup').children[data.colIndex] as HTMLElement;
                data.colWidth = self.block.cols[data.colIndex].width;
            },
            moving: (ev, data, isend) => {
                self.isMoveLine = true;
                var dx = ev.clientX - event.clientX;
                var w = dx + data.colWidth;
                w = Math.max(w, 50);
                data.colEle.style.width = w + 'px';
                data.colEle.style.minWidth = w + 'px';
                var left = self.block.cols.findAll((g, i) => i < data.colIndex).sum(g => g.width) + w + 1;
                self.subline.style.left = (left + 5) + 'px';
                var tableRect = Rect.fromEle(self.table);
                self.subline.style.height = tableRect.height + 'px';
                if (isend) {
                    var cols = lodash.cloneDeep(self.block.cols);
                    var col = cols[data.colIndex];
                    col.width = w;
                    self.block.onUpdateProps({ cols })
                }
            },
            moveEnd() {
                self.isMoveLine = false;
            }
        })
    }
    onMousedownResize(event: React.MouseEvent, resize: 'right' | 'bottom' | 'resize') {
        var self = this;
        self.isMoveLine = true;
        var tableRect = Rect.fromEle(this.table);
        event.stopPropagation();
        var rowCount = this.block.childs.length;
        var columnCount = this.block.cols.length;
        var endEmptyRowCount = 0;
        var endEmptyColumnCount = 0;
        for (let i = this.block.childs.length - 1; i > 0; i--) {
            if (this.block.childs[i].childs.every(g => g.childs.length == 0)) {
                endEmptyRowCount += 1;
            }
            else break;
        }
        for (let c = this.block.cols.length - 1; c > 0; c--) {
            var cs = this.block.childs.map(g => g.childs[c]);
            if (cs.every(c => c.childs.length == 0)) endEmptyColumnCount += 1;
            else break;
        }
        var top: number, left: number;
        if (resize == 'resize') {
            top = parseInt(this.resizePlus.style.top.replace('px', ''));
            left = parseInt(this.resizePlus.style.left.replace('px', ''));
        }
        else {
            top = parseInt(this.bottomPlus.style.top.replace('px', ''));
            left = parseInt(this.rightPlus.style.left.replace('px', ''));
        }
        var rdata: string = '';
        MouseDragger({
            event,
            cursor: 'col-resize',
            moveStart: (ev, data) => {

            },
            move: async (ev, data) => {
                var rc = rowCount;
                var rx = columnCount;
                if (resize == 'bottom') {

                    var dy = ev.clientY - event.clientY;
                    rc = rowCount + Math.ceil(dy / CELL_HEIGHT);
                    if (rc < rowCount - endEmptyRowCount) rc = rowCount - endEmptyRowCount;
                    this.bottomPlus.style.top = (top + (rc - rowCount) * CELL_HEIGHT) + 'px';
                }
                if (resize == 'right') {

                    var dx = ev.clientX - event.clientX;
                    rx = columnCount + Math.ceil(dx / COL_WIDTH);
                    if (rx < columnCount - endEmptyColumnCount) rx = columnCount - endEmptyColumnCount;
                    this.rightPlus.style.left = (left + (rx - columnCount) * COL_WIDTH) + 'px';
                }
                if (resize == 'resize') {

                    var dy = ev.clientY - event.clientY;
                    rc = rowCount + Math.ceil(dy / CELL_HEIGHT);
                    this.resizePlus.style.top = (ev.clientY - tableRect.top) + 'px';
                    if (rc < rowCount - endEmptyRowCount) rc = rowCount - endEmptyRowCount;
                    this.resizePlus.style.top = (top + (rc - rowCount) * CELL_HEIGHT) + 'px';

                    this.resizePlus.style.left = (ev.clientX - tableRect.left) + 'px';
                    var dx = ev.clientX - event.clientX;
                    rx = columnCount + Math.ceil(dx / COL_WIDTH);
                    if (rx < columnCount - endEmptyColumnCount) rx = columnCount - endEmptyColumnCount;
                    this.resizePlus.style.left = (left + (rx - columnCount) * COL_WIDTH) + 'px';
                }
                var args = {
                    row: rowCount,
                    column: columnCount,
                    newRow: rc,
                    newColumn: rx
                }
                if (JSON.stringify(args) == rdata) return;
                rdata = JSON.stringify(args);
                this.block.onDragAdd(args);
            },
            moveEnd: async (ev, isMove) => {
                self.isMoveLine = false;
                rdata = '';
                if (isMove) {
                    var rc = rowCount;
                    var rx = columnCount;
                    if (resize == 'bottom') {
                        var dy = ev.clientY - event.clientY;
                        rc = rowCount + Math.ceil(dy / CELL_HEIGHT);
                        if (rc < rowCount - endEmptyRowCount) rc = rowCount - endEmptyRowCount;
                    }
                    if (resize == 'right') {
                        var dx = ev.clientX - event.clientX;
                        rx = columnCount + Math.ceil(dx / COL_WIDTH);
                        if (rx < columnCount - endEmptyColumnCount) rx = columnCount - endEmptyColumnCount;
                    }
                    if (resize == 'resize') {
                        var dy = ev.clientY - event.clientY;
                        rc = rowCount + Math.ceil(dy / CELL_HEIGHT);
                        if (rc < rowCount - endEmptyRowCount) rc = rowCount - endEmptyRowCount;

                        var dx = ev.clientX - event.clientX;
                        rx = columnCount + Math.ceil(dx / COL_WIDTH);
                        if (rx < columnCount - endEmptyColumnCount) rx = columnCount - endEmptyColumnCount;
                    }
                    this.block.onDragAdd({
                        save: true,
                        row: rowCount,
                        column: columnCount,
                        newRow: rc,
                        newColumn: rx
                    });
                    self.bottomPlus.style.display = 'none';
                    self.rightPlus.style.display = 'none';
                    self.resizePlus.style.display = 'none';
                }
                else {
                    self.bottomPlus.style.display = 'none';
                    self.rightPlus.style.display = 'none';
                    self.resizePlus.style.display = 'none';
                    if (resize == 'bottom') {
                        await self.block.onAddRow();
                    }
                    else if (resize == 'right') {
                        await self.block.onAddColumn();
                    }
                    else if (resize == 'resize') {
                        await self.block.onAddColumn();
                        await self.block.onAddRow(undefined, undefined, true);
                    }
                }
            }
        })
    }
    onMousedownDrag(event: React.MouseEvent, arrow: 'top' | 'left') {
        var self = this;
        self.isMoveLine = true;
        event.stopPropagation();
        var boxRect = Rect.fromEle(this.box);
        var tableRect = Rect.fromEle(this.table);
        var scrollLeft = this.box.scrollLeft;
        var tableLeft = boxRect.left - scrollLeft;
        if (arrow == 'top') {
            var colIndex = parseInt(self.topDrag.getAttribute('data-index'));
            var col = this.block.cols[colIndex];
            var trs = Array.from(this.table.querySelector('tbody').children);
            MouseDragger({
                event,
                moveStart: (ev, data) => {
                    var html = `${trs.map(tr => (tr.children[colIndex] as HTMLElement).outerHTML).map(c => `<tr>${c}</tr>`).join("")}`
                    html = `<div class='sy-block-table'><table>
                    <colgroup><col style='min-width:${col.width}px;width:${col.width}px'></col></colgroup>
                    <tbody>${html}</tbody></table></div>`
                    ghostView.load(html, { point: Point.from(event) });
                    self.topDrag.style.display = 'none';
                },
                moving: (ev, data, isend) => {
                    ghostView.move(Point.from(ev));
                    var w = tableLeft + 5;
                    var isFind: boolean = false;
                    for (let i = 0; i < this.block.cols.length; i++) {
                        var col = this.block.cols[i];
                        if (ev.clientX >= w && ev.clientX <= w + col.width) {
                            if (ev.clientX >= w + col.width / 2) {
                                this.subline.setAttribute('data-index', (i + 1).toString());
                                this.subline.style.left = ((w - tableLeft) + col.width + 1) + 'px';
                            }
                            else {
                                this.subline.setAttribute('data-index', i.toString());
                                this.subline.style.left = ((w - tableLeft) + 1) + 'px';
                            }
                            this.subline.style.display = 'block';
                            this.subline.style.height = tableRect.height + 'px';
                            isFind = true;
                        }
                        w += col.width;
                    }
                    if (!isFind) {
                        this.subline.style.display = 'none';
                        this.subline.removeAttribute('data-index');
                    }
                },
                moveEnd: (ev, isMove) => {
                    if (isMove) {
                        var newColIndex = parseInt(this.subline.getAttribute('data-index'));
                        if (!isNaN(newColIndex) && newColIndex != colIndex) {
                            console.log(colIndex, newColIndex);
                            self.block.onChangeColumnIndex(colIndex, newColIndex);
                        }
                        self.isMoveLine = false;
                        this.subline.style.display = 'none';
                        this.subline.removeAttribute('data-index');
                        ghostView.unload();
                    }
                    else {
                        self.isMoveLine = false;
                    }
                }
            })
        }
        else if (arrow == 'left') {
            self.isMoveLine = true;
            var trs = Array.from(this.table.querySelector('tbody').children);
            var rowIndex = parseInt(self.leftDrag.getAttribute('data-index'));
            MouseDragger<{ colIndex: number, colWidth: number, colEle: HTMLElement }>({
                event,
                moveStart: (ev, data) => {
                    var html = trs[rowIndex].outerHTML;
                    ghostView.load(`<div class='sy-block-table'><table>
                    ${this.table.querySelector('colgroup').outerHTML}
                    <tbody>${html}</tbody>
                    </table></div>`, { point: Point.from(event) });
                    self.leftDrag.style.display = 'none';
                },
                moving: (ev, data, isend) => {
                    ghostView.move(Point.from(ev));
                    var isFind: boolean = false;
                    for (let s = 0; s < trs.length; s++) {
                        var tr = trs[s] as HTMLElement;
                        var trRect = Rect.fromEle(tr);
                        if (ev.clientY >= trRect.top && ev.clientY <= trRect.bottom) {
                            var index = s;
                            if (ev.clientY > trRect.middle) {
                                index += 1;
                                this.sublineX.style.top = (trRect.bottom - boxRect.top) + 'px';
                            }
                            else {
                                this.sublineX.style.top = (trRect.top - boxRect.top) + 'px';
                            }
                            this.sublineX.style.width = trRect.width + 'px';
                            this.sublineX.style.display = 'flex';
                            this.sublineX.setAttribute('data-index', index.toString());
                            isFind = true;
                            break;
                        }
                    }
                    if (!isFind) {
                        this.sublineX.style.display = 'none';
                        this.sublineX.removeAttribute('data-index');
                    }
                },
                moveEnd: () => {
                    self.isMoveLine = false;
                    var newRowIndex = parseInt(this.sublineX.getAttribute('data-index'));
                    if (!isNaN(newRowIndex) && rowIndex != newRowIndex) {
                        self.block.onChangeRowIndex(rowIndex, newRowIndex);
                    }
                    this.sublineX.style.display = 'none';
                    ghostView.unload();
                }
            })
        }
    }
    onMouseleave() {
        if (this.isMoveLine == false) {
            this.subline.style.display = 'none';
            this.sublineX.style.display = 'none';
            this.bottomPlus.style.display = 'none';
            this.rightPlus.style.display = 'none';
            this.resizePlus.style.display = 'none';
            this.topDrag.style.display = 'none';
            this.leftDrag.style.display = 'none';
        }
    }
    table: HTMLElement;
    box: HTMLElement;
    subline: HTMLElement;
    sublineX: HTMLElement;
    bottomPlus: HTMLElement;
    rightPlus: HTMLElement;
    resizePlus: HTMLElement;
    topDrag: HTMLElement;
    leftDrag: HTMLElement;
    private isMoveLine: boolean = false;
    render() {
        return <div style={this.block.visibleStyle}><div className='sy-block-table'
            style={this.block.contentStyle}
            onMouseMove={e => this.mousemove(e.nativeEvent)} onMouseLeave={e => this.onMouseleave()}>
            <div className='sy-block-table-box' ref={e => this.box = e}>
                <table ref={e => this.table = e}>
                    <colgroup>
                        {this.block.cols.map((col, index) => {
                            return <col key={index} style={{ minWidth: col.width, width: col.width }}></col>
                        })}
                    </colgroup>
                    <tbody>
                        <ChildsArea childs={this.block.childs}></ChildsArea>
                    </tbody>
                </table>
                <div className='sy-block-table-subline' onMouseDown={e => this.onMousedownLine(e)} ref={e => this.subline = e}></div>
                <div className='sy-block-table-subline-x' ref={e => this.sublineX = e}></div>
                <div onMouseDown={e => this.onMousedownDrag(e, 'top')} ref={e => this.topDrag = e} className="sy-block-table-top-drag"><span>
                </span>
                </div>
                <div onMouseDown={e => this.onMousedownDrag(e, 'left')} ref={e => this.leftDrag = e} className="sy-block-table-left-drag"><span>
                </span>
                </div>
                <div onMouseDown={e => this.onMousedownResize(e, 'bottom')} ref={e => this.bottomPlus = e} className="sy-block-table-bottom-plus"><Icon size={10} icon={PlusSvg}></Icon></div>
                <div onMouseDown={e => this.onMousedownResize(e, 'right')} ref={e => this.rightPlus = e} className="sy-block-table-right-plus"><Icon size={10} icon={PlusSvg}></Icon></div>
                <div onMouseDown={e => this.onMousedownResize(e, 'resize')} ref={e => this.resizePlus = e} className="sy-block-table-resize-plus"><Icon size={10} icon={PlusSvg}></Icon></div>
            </div>
        </div></div>
    }
}