import React from "react";
import { UserAvatars } from "../../../../component/view/avator/users";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";

@url('/form/user')
export class FieldUser extends OriginFormField {

}

@view('/form/user')
export class FieldTextView extends BlockView<FieldUser>{
    render() {
        var self = this;
        var vs = this.block.value;
        if (!Array.isArray(vs) && vs) vs = [vs];
        if (!Array.isArray(vs)) vs = [];
        return <FieldView block={this.block}>
            <UserAvatars size={30} users={vs}></UserAvatars>
        </FieldView>
    }
}