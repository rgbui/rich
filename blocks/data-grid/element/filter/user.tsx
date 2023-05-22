
import React from "react";
import { UserAvatars } from "../../../../component/view/avator/users";
import { useUserPicker } from "../../../../extensions/at/picker";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";

@url('/field/filter/user')
export class SearchUser extends OriginFilterField {
    @prop()
    isMultiple: boolean = false;
    selectUsers: string[] = [];
    onFilter(value: string) {
        this.selectUsers = [value];
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
}

@view('/field/filter/user')
export class SearchTextView extends BlockView<SearchUser>{
    async mousedown(event: React.MouseEvent) {
        var r = await useUserPicker({ roundArea: Rect.fromEvent(event) });
        if (r) {
            this.block.onFilter(r.id)
        }
    }
    render() {
        return <div style={this.block.visibleStyle}><OriginFilterFieldView style={this.block.contentStyle}
            filterField={this.block}
        >
            <div onMouseDown={e => this.mousedown(e)}>
                {!(this.block.selectUsers?.length > 0) && <em className="remark f-14">所有人</em>}
                <UserAvatars size={30} users={this.block.selectUsers}></UserAvatars>
            </div>
        </OriginFilterFieldView ></div>
    }
}