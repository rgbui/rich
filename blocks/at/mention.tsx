import React from "react";
import { UserBox } from "../../component/view/avator/user";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { url, prop, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import "./style.less";
@url('/user/mention')
export class ShyMention extends Block {
    @prop()
    userid: string = '';
    display = BlockDisplay.inline;
    openUser(event: React.MouseEvent) {

    }
}
@view('/user/mention')
export class ShyMentionView extends BlockView<ShyMention>{
    render() {
        return <div className='sy-block-mention' onMouseDown={e => this.block.openUser(e)} >
            <UserBox userid={this.block.userid}>{(user) => {
                return <>@<span>{user.name}</span></>
            }}</UserBox>
        </div>
    }
}