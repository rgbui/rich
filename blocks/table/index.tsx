import { Block } from "../../src/block";
import { BlockView } from "../../src/block/view";
import React from "react";
import { prop, url, view } from "../../src/block/factory/observable";
import "./style.less";
import { BlockDisplay } from "../../src/block/enum";
import { ChildsArea } from "../../src/block/view/appear";
import { ActionDirective } from "../../src/history/declare";
import { Rect } from "../../src/common/point";
import lodash from 'lodash';
import { MouseDragger } from "../../src/common/dragger";

@url('/table')
export class Table extends Block {
    display = BlockDisplay.block;
    @prop()
    cols: { width: number }[] = [];
    async created() {
        await this.updateProps({ cols: [{ width: 250 }, { width: 250 }] });
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
                await this.updateProps({ cols: [{ width: 250 }] });
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

}
@view('/table')
export class TableView extends BlockView<Table>{
    mousemove(event: MouseEvent) {
        if (this.isMoveLine) return;
        var box = this.block.el.querySelector('.sy-block-table-box') as HTMLElement;
        var boxRect = Rect.fromEle(box);
        var tableRect = Rect.fromEle(box.querySelector('table'));
        var scrollLeft = box.scrollLeft;
        var tableLeft = boxRect.left - scrollLeft;
        var w = 0;
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
    }
    onMousedownLine(event: React.MouseEvent) {
        var self = this;
        self.isMoveLine = true;
        event.stopPropagation();
        MouseDragger<{ colIndex: number, colWidth: number, colEle: HTMLElement }>({
            event,
            cursor: 'col-resize',
            moveStart: (ev, data) => {
                data.colIndex = parseInt(self.subline.getAttribute('data-index'));
                data.colEle = self.block.el.querySelector('colgroup').children[data.colIndex] as HTMLElement;
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
                self.subline.style.left = left + 'px';
                var tableRect = Rect.fromEle(self.block.el.querySelector('table'));
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
    subline: HTMLElement;
    private isMoveLine: boolean = false;
    render() {
        return <div className='sy-block-table' style={this.block.visibleStyle}
            onMouseMove={e => this.mousemove(e.nativeEvent)}>
            <div className='sy-block-table-box'>
                <div className='sy-block-table-subline' onMouseDown={e => this.onMousedownLine(e)} ref={e => this.subline = e}></div>
                <table>
                    <colgroup>
                        {this.block.cols.map((col, index) => {
                            return <col key={index} style={{ minWidth: col.width, width: col.width }}></col>
                        })}
                    </colgroup>
                    <tbody>
                        <ChildsArea childs={this.block.childs}></ChildsArea>
                    </tbody>
                </table>
            </div>
        </div>
    }
}