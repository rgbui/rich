import React from "react";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { SolidArea } from "../../src/block/view/appear";

@url('/tag')
export class ShyTag extends Block {
    display = BlockDisplay.inline;
    @prop()
    tagId: string = null;
    tagText: string = '';
    @prop()
    refLinks: {
        id: string,
        type: 'page' | "tag" | "comment" | "mention" | "time",
        pageId?: string,
        tagId?: string,
        commentId?: string,
        userid?: string,
    }[] = null;
}
@view('/tag')
export class ShyMentionView extends BlockView<ShyTag>{
    render() {
        return <span className="sy-block-tag">
            <SolidArea block={this.block} prop={'userid'} >#{this.block.tagText}</SolidArea>
        </span>
    }
}


