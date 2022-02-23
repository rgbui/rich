import React from "react";
import { PlusSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { useRelationPickData } from "../../../../extensions/tablestore/relation.picker";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { OriginField } from "./origin.field";

@url('/field/relation')
export class FieldRelation extends OriginField {
    get relationList() {
        return []
    }
}
@view('/field/relation')
export class FieldRelationView extends BlockView<FieldRelation>{
    async onPickRelationData(event: React.MouseEvent) {
        var r = await useRelationPickData({ roundArea: Rect.fromEvent(event) }, {
            field: this.block.viewField.field,
            relationDatas: []
        });
    }
    renderList() {
        return <div>
            <Icon click={e => this.onPickRelationData(e)} icon={PlusSvg}></Icon>
        </div>
    }
    render() {
        return <div className='sy-field-relation'>
            {this.renderList()}
        </div>
    }
}