import React from "react";
import { Avatar } from "../../../../component/view/avator/face";
import { UserAvatars } from "../../../../component/view/avator/users";
import { useDataGridFileViewer } from "../../../../extensions/data-grid/filer";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { FieldType } from "../../schema/type";
import { OriginField } from "./origin.field";

@url('/field/user')
export class FieldUser extends OriginField {
    async onCellMousedown(event: React.MouseEvent) {
        if (this.checkEdit() === false) return;
        if (![FieldType.creater, FieldType.modifyer].includes(this.field.type)) {
            var vs = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
            if (!this.field?.config?.isMultiple) {
                vs = vs.slice(0, 1);
            }
            var rs = await useDataGridFileViewer({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, {
                mime: 'user',
                resources: vs,
                isMultiple: this.field?.config?.isMultiple ? true : false
            });
            if (Array.isArray(rs))
            {
                this.value = rs;
                this.onUpdateCellValue(this.value);
                this.forceUpdate();
            }
        }
    }
}

@view('/field/user')
export class FieldTextView extends BlockView<FieldUser>{
    renderView()  {
        if (this.block.field.type == FieldType.creater || this.block.field.type == FieldType.modifyer)
            return <div className='sy-field-text'>
                {this.block.value && <Avatar size={30} userid={this.block.value}></Avatar>}
            </div>
        else {
            var vs = this.block.value;
            if (!Array.isArray(vs) && vs) vs = [vs];
            if (!Array.isArray(vs)) vs = [];
            return <div className='sy-field-text'>
                <UserAvatars size={30} users={vs}></UserAvatars>
            </div>
        }
    }
}