import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";

@url('/field/relation')
export class FieldRelation extends OriginField {

}
@view('/field/relation')
export class FieldRelationView extends BlockView<FieldRelation>{
    render() {
        return <div className='sy-field-relation'>

        </div>
    }
}