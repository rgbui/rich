import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "../../element/field/origin.field";
import { TableStoreItem } from "../item";

@url('/data-grid/list/row')
export class TableStoreListItem extends TableStoreItem {

}

@view('/data-grid/list/row')
export class TableStoreListItemView extends BlockView<TableStoreListItem>{
    render() {
        var title = this.block.childs.find(g => (g as OriginField).url == '/field/title');
        var cs = this.block.childs.findAll(g => g !== title);
        return <div className="flex-top item-hover round padding-5 ">
            <div className="flex-fixed">
                {title && <title.viewComponent block={title}></title.viewComponent>}
            </div>
            <div className="flex-auto flex-top-end">
                {cs.map(c => {
                    return <div className="gap-l-10" key={c.id}>
                        <c.viewComponent block={c}></c.viewComponent>
                    </div>
                })}
            </div>
        </div>
    }
}
