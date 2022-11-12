import React from "react";
import { Switch } from "../../../../component/view/switch";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";


@url('/form/check')
class FieldText extends OriginFormField {

}
@view('/form/check')
class FieldTextView extends BlockView<FieldText>{
    render() {
        var self = this;
        return <FieldView block={this.block}>
            <Switch
                checked={this.block.value}
                onChange={e => { this.block.value = e; this.forceUpdate() }}></Switch>

        </FieldView>
    }
}