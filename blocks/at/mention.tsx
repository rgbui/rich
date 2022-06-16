import React from "react";
import { Avatar } from "../../component/view/avator/face";
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
                console.log('user', user);
                return <><Avatar size={30} userid={user.id} user={user}></Avatar><span>{user.name}</span></>
            }}</UserBox>
        </div>
    }
}