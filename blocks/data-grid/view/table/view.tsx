import React from "react"
import { TableStore } from "."
import { Icon } from "../../../../component/view/icon"
import { view } from "../../../../src/block/factory/observable"
import { BlockView } from "../../../../src/block/view"
import { DataGridTool } from "../components/tool"
import { Spin, SpinBox } from "../../../../component/view/spin"
import { S } from "../../../../i18n/view"
import { DataGridTableContent } from "./content"
import { Rect } from "../../../../src/common/vector/point"
import dayjs from "dayjs"
import weekOfYear from "dayjs/plugin/weekOfYear"
import { DataGridGroup } from "../components/group"
import { ScrollXDataGrid } from "./xscroll"
import lodash from "lodash"
import { ObserverWidth } from "../../../../src/common/Observer.width"
dayjs.extend(weekOfYear)

@view('/data-grid/table')
export class TableStoreView extends BlockView<TableStore> {
    renderCreateTable() {
        if (this.block.isLoading) return <Spin block></Spin>
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
                    onMouseMove={e => this.block.onOver(true)}
                    onMouseEnter={e => this.block.onOver(true)}
                    onMouseLeave={e => this.block.onOver(false)}
                >

                    {this.block.schema && <DataGridTool block={this.block}></DataGridTool>}
                    {this.renderCreateTable()}

                    <SpinBox spin={this.block.isLoadingData}>
                        <ScrollXDataGrid ref={e => this.xd = e} className="sy-dg-table-content" block={this.block}>
                            <DataGridGroup block={this.block} renderRowContent={(b, c, g) => {
                                return <DataGridTableContent groupHead={g} block={b} childs={c}></DataGridTableContent>
                            }}></DataGridGroup>
                        </ScrollXDataGrid>
                    </SpinBox>
                </div>
            </div>
            {this.renderComment()}
        </div>
    }
    async didMount() {
        var sd = this.props.block.page.getScrollDiv() as HTMLElement;
        if (sd) sd.addEventListener('scroll', this._scroll)
        if (this.block.el) {
            ObserverWidth.width(this.block.el, this.widthChange)
        }
    }
    willUnmount() {
        var sd = this.props.block.page.getScrollDiv() as HTMLElement;
        if (sd) sd.removeEventListener('scroll', this._scroll);
        if (this.block.el) {
            ObserverWidth.cancel(this.block.el);
        }
    }
    _scroll = (e) => {
        if (this.block.schema && this.block.noHead != true) {
            var div = this.props.block.page.getScrollDiv() as HTMLElement;
            if (div) {
                var headScrollEl = this.block.el.querySelector('.scroll-hidden') as HTMLElement;
                var el = this.block.el;
                var db = Rect.fromEle(div);
                var box = this.block.el.querySelector('.sy-dg-table-content');
                if (box) {
                    if (headScrollEl)
                        headScrollEl.scrollLeft = box.scrollLeft;

                }
                var rs = Array.from(el.querySelectorAll('.sy-dg-table-body'));
                if (rs.length > 0) {
                    for (let i = 0; i < rs.length; i++) {
                        var r = rs[i] as HTMLElement;
                        var rb = Rect.fromEle(r);
                        if (db.top > rb.top && db.top < rb.bottom) {
                            if (headScrollEl)
                                headScrollEl.style.display = 'block';
                            return
                        }
                    }
                }
                if (headScrollEl)
                    headScrollEl.style.display = 'none';
            }
        }
    }
    xd: ScrollXDataGrid;
    widthChange = lodash.debounce(() => {
        if (this.xd) {
            this.xd.AdjustWidth()
        }
    }, 300)
}