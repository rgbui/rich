import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";

@url('/form/object')
class FieldObject extends OriginFormField {

}
@view('/form/object')
class FieldObjectView extends BlockView<FieldObject>{
    render() {
        var self = this;
        function keydown(event: React.KeyboardEvent<HTMLInputElement>) {
            if (event.key == 'Enter') {
                self.block.onChange((event.target as HTMLInputElement).value);
            }
        }
        return <FieldView block={this.block}>

        </FieldView>
    }
}