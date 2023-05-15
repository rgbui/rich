import React from "react";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { SolidArea } from "../../src/block/view/appear";
import { Rect } from "../../src/common/vector/point";
import { useTagViewer } from "../../extensions/tag/view";

@url('/tag')
export class ShyTag extends Block {
    display = BlockDisplay.inline;
    @prop()
    tagId: string = null;
    @prop()
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
    async openTag(event: React.MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        await useTagViewer(
            { roundArea: Rect.fromEvent(event) },
            { tagId: this.tagId })
    }
    async didMounted() {
        this.loadTag();
    }
    async loadTag() {

    }
}
@view('/tag')
export class ShyMentionView extends BlockView<ShyTag>{
    render() {
        return <span className="sy-block-tag" onMouseDown={e => this.block.openTag(e)}>
            <SolidArea block={this.block} prop={'userid'} >#{this.block.tagText}</SolidArea>
        </span>
    }
}


