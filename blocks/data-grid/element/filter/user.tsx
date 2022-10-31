
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
    }
    get filters() {
        if (!(Array.isArray(this.selectUsers) && this.selectUsers.length > 0)) return {}
        return {
            [this.field.name]: {
                $in: this.selectUsers
            }
        }
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
        return <OriginFilterFieldView
            filterField={this.block}
        >
            <div onMouseDown={e => this.mousedown(e)}><UserAvatars users={this.block.selectUsers}></UserAvatars></div>
        </OriginFilterFieldView >
    }
}