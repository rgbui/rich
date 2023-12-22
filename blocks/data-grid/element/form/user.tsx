import React from "react";
import { PlusSvg } from "../../../../component/svgs";
import { UserAvatars } from "../../../../component/view/avator/users";
import { Icon } from "../../../../component/view/icon";
import { useDataGridFileViewer } from "../../../../extensions/data-grid/filer";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { FieldView, OriginFormField } from "./origin.field";
import { util } from "../../../../util/util";
import { S } from "../../../../i18n/view";

@url('/form/user')
export class FieldUser extends OriginFormField {
    async onSelectUser(event: React.MouseEvent) {
        if (this.checkEdit() === false) return;
        var vs = this.value;
        if (!Array.isArray(vs) && vs) vs = [vs];
        if (!Array.isArray(vs)) vs = [];
        var rs = await useDataGridFileViewer({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, {
            mime: 'user',
            resources: vs,
            isMultiple: this.field?.config?.isMultiple ? true : false
        });
        if (Array.isArray(rs)) {
            this.value = rs;
            this.forceUpdate();
        }
    }
}

@view('/form/user')
export class FieldTextView extends BlockView<FieldUser>{
    renderView() {
        var vs = util.covertToArray(this.block.value);
        return <FieldView block={this.block} className={'visible-hover'}>
            <div className={this.block.fieldType !== 'doc' ? "" : "gap-w-10"}>
                <UserAvatars size={30} users={vs}>
                    {(this.block.field?.config?.isMultiple || vs.length < 2) && this.block.fieldType != 'doc-detail' && <span onMouseDown={e => this.block.onSelectUser(e)}
                        className={"round item-hover-light-focus item-hover size-24 flex-center cursor" + (vs.length == 0 ? " " : " visible")}
                    ><Icon size={16} icon={PlusSvg}></Icon></span>}
                </UserAvatars>
                {vs.length == 0 && this.block.fieldType == 'doc-detail' && <span className="f-14 remark"><S>空内容</S></span>}
            </div>
        </FieldView>
    }
}