import React from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";

@url('/discuss')
export class Discuss extends Block {
    @prop()
    sort = 'default';
    getDiscussElementUrl() {
        return this.page.elementUrl;
    }
    async getMd() {
        return '';
    }
}

@view('/discuss')
export class DiscussView extends BlockView<Discuss>{
    renderView() {
        return <div
            style={this.block.visibleStyle}
            onMouseDown={e => e.stopPropagation()}>

        </div>
    }

}