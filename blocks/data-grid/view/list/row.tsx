import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "../../element/field/origin.field";
import { TableStoreItem } from "../item";
import { TableStoreList } from ".";
import { CardFactory } from "../../template/card/factory/factory";
import { Rect } from "../../../../src/common/vector/point";

@url('/data-grid/list/row')
export class TableStoreListItem extends TableStoreItem {
    get isShowHandleBlock(): boolean {
        if (this.tableStoreList.isCardAuto) return false;
        return true
    }
    get tableStoreList() {
        return this.parent as TableStoreList;
    }
    getVisibleHandleCursorPoint() {
        var rect = Rect.fromEle(this.el);
        var point = rect.leftMiddle;
        return point;
    }
}
@view('/data-grid/list/row')
export class TableStoreListItemView extends BlockView<TableStoreListItem>{
    renderRows() {
        var title = this.block.childs.find(g => (g as OriginField).url == '/field/title');
        var cs = this.block.childs.findAll(g => g !== title);
        return <div className="flex item-light-hover round padding-5 visible-hover ">
            <div className="flex-fixed bold cursor">
                {title && <title.viewComponent block={title}></title.viewComponent>}
            </div>
            <div className="flex-auto flex-end">
                {cs.map(c => {
                    return <div className="gap-l-10" key={c.id}>
                        <c.viewComponent block={c}></c.viewComponent>
                    </div>
                })}
            </div>
        </div>
    }
    renderDefine() {
        var CV = CardFactory.getCardView(this.block.tableStoreList.cardConfig.templateProps.url);
        if (CV) return <CV item={this.block} dataGrid={this.block.tableStoreList}></CV>
        else return this.renderRows()
    }
    renderView() {
        if (this.block.tableStoreList.cardConfig.showMode == 'define' && this.block.tableStoreList.cardConfig.templateProps.url)
            return this.renderDefine()
        else return this.renderRows()
    }
}
