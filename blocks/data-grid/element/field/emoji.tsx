import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";

@url('/field/emoji')
export class FieldEmoji extends OriginField {

}
@view('/field/emoji')
export class FieldEmailView extends BlockView<FieldEmoji>{
    render() {
        return <div className='sy-field-email'>
            {this.block.viewField?.field.config?.emoji?.code}
        </div>
    }
}