import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "../../element/field/origin.field";
import { TableStoreItem } from "../item";

@url('/data-grid/list/row')
export class TableStoreListItem extends TableStoreItem {
    get isShowHandleBlock(): boolean {
        return true;
    }
}

@view('/data-grid/list/row')
export class TableStoreListItemView extends BlockView<TableStoreListItem>{
    render() {
        var title = this.block.childs.find(g => (g as OriginField).url == '/field/title');
        var cs = this.block.childs.findAll(g => g !== title);
        return <div className="flex item-hover round padding-5 ">
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
}
