import React from "react"
import { TableStore } from "."
import { Icon } from "../../../../component/view/icon"
import { view } from "../../../../src/block/factory/observable"
import { BlockView } from "../../../../src/block/view"
import { DataGridTool } from "../components/tool"
import { Spin } from "../../../../component/view/spin"
import { S } from "../../../../i18n/view"
import { DataGridTableContent, DataGridTableHead } from "./content"
import { Rect } from "../../../../src/common/vector/point"
import dayjs from "dayjs"
import weekOfYear from "dayjs/plugin/weekOfYear"
import { DataGridGroup } from "../components/group"
dayjs.extend(weekOfYear)

@view('/data-grid/table')
export class TableStoreView extends BlockView<TableStore> {
    renderCreateTable() {
        if (this.block.isLoading) return <></>
        if (this.block.isLoadingData) return <></>
        return !this.block.schema && this.block.isCanEdit() && <div className="item-hover item-hover-focus padding-5 cursor round flex" onClick={e => this.block.onCreateTableSchema()}>
            {this.block.willCreateSchema && <Spin></Spin>}
            {!this.block.willCreateSchema && <> <span className="size-24 flex-center remark"><Icon size={16} icon={{ name: 'byte', code: 'table' }}></Icon></span>
                <span className="remark"><S>添加或创建数据表</S></span></>}
        </div>
    }
    renderView() {
        return <div style={this.block.visibleStyle}>
            <div style={this.block.contentStyle}>
                <div className={"sy-dg-table" +
                    (this.block.noBorder ? " sy-dg-table-no-border" : "") +
                    (this.block.noHead ? " sy-dg-table-no-header" : "")
                }
                    onMouseEnter={e => this.block.onOver(true)}
                    onMouseLeave={e => this.block.onOver(false)}
                >
                    {this.block.isLoading && <Spin block></Spin>}
                    {this.block.schema && <DataGridTool block={this.block}></DataGridTool>}
                    {this.block.schema && this.block.noHead !== true && <div
                        ref={e => {
                            this.headScrollEl = e;
                            this.bindScroll();
                        }}
                        className="scroll-hidden"
                        style={{
                            overflowX: 'auto',
                            zIndex: 1,
                            position: 'sticky',
                            top: 0,
                            display: 'none'
                        }}><DataGridTableHead style={{ backgroundColor: '#fff' }} block={this.block}></DataGridTableHead>
                    </div>}
                    <div className="sy-dg-table-content" >
                        <DataGridGroup block={this.block} renderRowContent={(b, c, g) => {
                            return <DataGridTableContent groupHead={g} block={b} childs={c}></DataGridTableContent>
                        }}></DataGridGroup>
                    </div>
                    {this.renderCreateTable()}
                </div>
            </div>
            {this.renderComment()}
        </div>
    }
    headScrollEl: HTMLElement;
    async didMount() {
        var sd = this.props.block.page.getScrollDiv() as HTMLElement;
        if (sd) sd.addEventListener('scroll', this._scroll)
        var box = this.block.el.querySelector('.sy-dg-table-content');
        if (box) {
            box.addEventListener('scroll', this.content_scroll);
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
    bindScroll() {
        if (this.headScrollEl) {
            this.headScrollEl.removeEventListener('scroll', this.head_scroll);
            this.headScrollEl.addEventListener('scroll', this.head_scroll);
        }
    }
    _scroll = (e) => {
        if (this.block.schema && this.block.noHead != true) {
            var div = this.props.block.page.getScrollDiv() as HTMLElement;
            if (div) {
                var el = this.block.el;
                var db = Rect.fromEle(div);
                var box = this.block.el.querySelector('.sy-dg-table-content');
                if (box) {
                    this.headScrollEl.scrollLeft = box.scrollLeft;

                }
                var rs = Array.from(el.querySelectorAll('.sy-dg-table-body'));
                if (rs.length > 0) {
                    for (let i = 0; i < rs.length; i++) {
                        var r = rs[i] as HTMLElement;
                        var rb = Rect.fromEle(r);
                        if (db.top > rb.top && db.top < rb.bottom) {
                            this.headScrollEl.style.display = 'block';
                            return
                        }
                    }
                }
                this.headScrollEl.style.display = 'none';
            }
        }
    }
    content_scroll = (e) => {
        var box = this.block.el.querySelector('.sy-dg-table-content');
        if (box) {
            this.headScrollEl.scrollLeft = box.scrollLeft;
            var group_heads = this.block.el.querySelectorAll('[data-sy-table="group-head"]');
            group_heads.forEach(h => {
                (h as HTMLElement).style.transform = `translateX(${box.scrollLeft}px)`;
                // (h as HTMLElement).style.marginLeft = `${box.scrollLeft}px`;
            })
        }
    }
    head_scroll = (e) => {
        var box = this.block.el.querySelector('.sy-dg-table-content');
        if (box) {
            box.scrollLeft = this.headScrollEl.scrollLeft;
        }
    }
}