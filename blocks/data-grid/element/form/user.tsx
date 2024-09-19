import React from "react";
import { UserAvatars } from "../../../../component/view/avator/users";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { FieldView, OriginFormField } from "./origin.field";
import { util } from "../../../../util/util";
import { useUserPicker } from "../../../../extensions/at/picker";
import { S } from "../../../../i18n/view";
import { FieldType } from "../../schema/type";

@url('/form/user')
export class FieldUser extends OriginFormField {
    async onSelectUser(event: React.MouseEvent) {
        if (this.checkEdit() === false) return;
        var vs = this.value;
        if (!Array.isArray(vs) && vs) vs = [vs];
        if (!Array.isArray(vs)) vs = [];
        if (!this.field?.config?.isMultiple) {
            vs = vs.slice(0, 1);
        }
        var rs = await useUserPicker({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, this.page.ws, {
            ignoreUserAll: true,
            isMultiple: this.field?.config?.isMultiple ? true : false,
            users: vs
        });
        if (rs && !Array.isArray(rs)) rs = [rs]
        if (Array.isArray(rs)) {
            var userids = rs.map(g => g.id);
            this.value = userids;
            this.forceManualUpdate();
        }
    }
}

@view('/form/user')
export class FieldTextView extends BlockView<FieldUser> {
    renderView() {
        var vs = util.covertToArray(this.block.value);
        return <FieldView block={this.block} className={'visible-hover'}>
            <div onMouseDown={async e => {
                if (this.block.fromType == 'doc-detail') return;
                if (this.block.field?.type == FieldType.creater || this.block.field?.type == FieldType.modifyer) return;
                var ele = e.currentTarget as HTMLElement;
                if (ele.classList.contains('item-hover-light')) {
                    ele.classList.add('item-hover-light-focus')
                }
                try {
                    e.stopPropagation();
                    await this.block.onSelectUser(e)
                }
                catch (ex) {

                }
                finally {
                    ele.classList.remove('item-hover-light-focus')
                }
            }} className={' ' + (this.block.fromType == 'doc' ? "item-hover-light padding-w-10 round" : (this.block.fromType == 'doc-add' ? " sy-form-field-input-value" : "  "))}>
                <div className="min-h-30 flex">
                    <UserAvatars size={24} users={vs}></UserAvatars>
                    {this.block.fromType != 'doc-add' && vs.length == 0 && <span className="f-14 remark" ><S>空内容</S></span>}
                </div>
            </div>
        </FieldView>
    }
}