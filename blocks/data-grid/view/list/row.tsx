import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "../../element/field/origin.field";
import { TableGridItem } from "../item";
import { TableStoreList } from ".";
import { CardFactory } from "../../template/card/factory/factory";
import { Rect } from "../../../../src/common/vector/point";
import { ChildsArea } from "../../../../src/block/view/appear";
import { Icon } from "../../../../component/view/icon";
import { S } from "../../../../i18n/view";
import { PlusSvg } from "../../../../component/svgs";

@url('/data-grid/list/row')
export class TableStoreListItem extends TableGridItem {
    get isShowHandleBlock(): boolean {
        if (this.tableStoreList.isCardAuto) return false;
        return true
    }
    get tableStoreList() {
        return this.dataGrid as TableStoreList;
    }
    getVisibleHandleCursorPoint() {
        var rect = Rect.fromEle(this.el);
        var point = rect.leftMiddle;
        return point;
    }
}

@view('/data-grid/list/row')
export class TableStoreListItemView extends BlockView<TableStoreListItem> {
    renderRows() {
        var title = this.block.childs.find(g => (g as OriginField).url == '/field/title');
        var cs = this.block.childs.findAll(g => g !== title);
        return <div>
            <div className="flex item-light-hover round padding-5  min-h-30 visible-hover ">
                <div onMouseDown={e => {
                    (title as OriginField).onCellMousedown(e)
                }} className="flex-fixed bold cursor min-w-200 max-w-400 "
                    style={{
                        paddingLeft: this.block.subDeep * 24
                    }}>
                    {title && <title.viewComponent block={title}></title.viewComponent>}
                </div>
                <div className="flex-auto flex-end text-overflow gap-l-30">
                    {cs.map(c => {
                        return <div onMouseDown={e => {
                            (c as OriginField).onCellMousedown(e)
                        }} className="gap-l-10 flex-fixed flex" key={c.id}>
                            <c.viewComponent block={c}></c.viewComponent>
                        </div>
                    })}
                </div>
            </div>
            {this.renderSubs()}
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
    renderSubs() {
        if (this.block.dataGrid?.schema?.allowSubs) {
            var pl = (this.block.subDeep + 1) * 24 + 25;
            if (this.block.subSpread == true) {
                return <div>
                    <div>
                        <ChildsArea childs={this.block.subChilds}></ChildsArea>
                    </div>
                    <div className="flex h-28 item-hover remark cursor" onMouseDown={e => {
                        e.stopPropagation()
                        this.block.onAddSub(e)
                    }} style={{
                        paddingLeft: pl
                    }}>
                        <span className="flex-fixed gap-l-6 flex-center size-20"> <Icon size={18} icon={PlusSvg}></Icon></span>
                        <span className="flex-fixed  gap-l-3 f-14"><S>添加子数据</S></span>
                    </div>
                </div>
            }
        }
        return <></>
    }
}
