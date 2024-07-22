import React from "react";
import { Avatar } from "../../../../component/view/avator/face";
import { UserAvatars } from "../../../../component/view/avator/users";
import { url, view } from "../../../../src/block/factory/observable";
import { Rect } from "../../../../src/common/vector/point";
import { FieldType } from "../../schema/type";
import { OriginField, OriginFileView } from "./origin.field";
import { useUserPicker } from "../../../../extensions/at/picker";

@url('/field/user')
export class FieldUser extends OriginField {
    async onCellMousedown(event: React.MouseEvent) {
        if (this.checkEdit() === false) return;
        if (![FieldType.creater, FieldType.modifyer].includes(this.field.type)) {
            var vs = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []);
            if (!this.field?.config?.isMultiple) {
                vs = vs.slice(0, 1);
            }
            var fn = async () => {
                var rs = await useUserPicker({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, this.page.ws, {
                    ignoreUserAll: true,
                    isMultiple: this.field?.config?.isMultiple ? true : false,
                    users: vs
                });
                if (rs && !Array.isArray(rs)) rs = [rs]
                if (Array.isArray(rs)) {
                    var userids = rs.map(g => g.id);
                    await this.onUpdateCellValue(userids);
                    this.forceManualUpdate();
                }
            }
            if (this.dataGrid) await this.dataGrid.onDataGridTool(fn)
            else await fn()
        }
    }
    get isFieldEmpty() {
        return !this.value || (Array.isArray(this.value) && this.value.length == 0)
    
    }
}

@view('/field/user')
export class FieldTextView extends OriginFileView<FieldUser> {
    renderFieldValue() {
        if (this.block.field.type == FieldType.creater || this.block.field.type == FieldType.modifyer)
            return <div className='sy-field-user'>
                {this.block.value && <Avatar showName middle hideStatus size={24} userid={this.block.value}></Avatar>}
            </div>
        else {
            var vs = this.block.value;
            if (!Array.isArray(vs) && vs) vs = [vs];
            if (!Array.isArray(vs)) vs = [];
            if (this.block.field.config?.isMultiple) {
                return <div className='sy-field-user'>
                    <UserAvatars showName={false} size={24} users={vs}></UserAvatars>
                </div>
            }
            else {
                return <div className='sy-field-user'>
                    {vs[0] && <Avatar showName middle hideStatus size={24} userid={vs[0]}></Avatar>}
                </div>
            }

        }
    }
}