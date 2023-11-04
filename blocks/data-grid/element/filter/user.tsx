
import React from "react";
import { UserAvatars } from "../../../../component/view/avator/users";
import { useUserPicker } from "../../../../extensions/at/picker";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";
import { S } from "../../../../i18n/view";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { lst } from "../../../../i18n/store";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";

@url('/field/filter/user')
export class SearchUser extends OriginFilterField {
    @prop()
    isMultiple: boolean = false;
    selectUsers: string[] = [];
    onFilter(value: string) {
        if (value == 'all') this.selectUsers = [];
        else {
            if (this.isMultiple) {
                if (!this.selectUsers.includes(value)) {
                    this.selectUsers.push(value)
                }
            }
            else this.selectUsers = [value];
        }
        if (this.refBlock) this.refBlock.onSearch()
        this.forceUpdate()
    }
    get filters() {
        if (!(Array.isArray(this.selectUsers) && this.selectUsers.length > 0)) return null;
        return [{
            field: this.field.name,
            operator: '$in',
            value: this.selectUsers
        }]
    }
    async onGetContextMenus()
    {
        var rs = await super.onGetContextMenus();
        var pos = rs.findIndex(g => g.name == 'showFieldText');
        if (pos > -1) {
            var ns: MenuItem<string | BlockDirective>[] = [];
            ns.push({
                name: 'isMultiple',
                text: lst('多选'),
                icon: { name: 'bytedance-icon', code: 'more-three' },
                checked: this.isMultiple,
                type: MenuItemType.switch,
            })
            rs.splice(pos + 1, 0, ...ns)
        }
        return rs;
    }
    async onContextMenuInput(item: MenuItem<string | BlockDirective>) {
        switch (item.name) {
            case 'isMultiple':
                this.onUpdateProps({ [item.name]: item.checked }, { range: BlockRenderRange.self })
                return;
        }
        super.onContextMenuInput(item)
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, e) {
        // switch (item.name) {
        //     case 'text-center':
        //         await this.onUpdateProps({ align: item.value }, { range: BlockRenderRange.self })
        //         return
        // }
        return await super.onClickContextMenu(item, e);
    }
}

@view('/field/filter/user')
export class SearchTextView extends BlockView<SearchUser>{
    async mousedown(event: React.MouseEvent) {
        var r = await useUserPicker({ roundArea: Rect.fromEvent(event) }, this.block.page.ws, { ignoreUserAll: true });
        if (r) {
            this.block.onFilter(r.id)
        }
    }
    renderView() {
        return <div style={this.block.visibleStyle}><OriginFilterFieldView style={this.block.contentStyle}
            filterField={this.block}
        >
            <div onMouseDown={e => this.mousedown(e)}>
                {!(this.block.selectUsers?.length > 0) && <em className="remark f-14"><S>所有人</S></em>}
                <UserAvatars size={24} users={this.block.selectUsers}></UserAvatars>
            </div>
        </OriginFilterFieldView ></div>
    }
}