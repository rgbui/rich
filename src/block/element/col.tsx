

import { Content } from "./content";

import React from 'react';
import { BlockAppear, BlockDisplay } from "../enum";
import { url, view } from "../factory/observable";
import { BlockView } from "../view";
import { ChildsArea } from "../partial/appear";

@url('/col')
export class Col extends Content {
    display = BlockDisplay.block;
    appear = BlockAppear.layout;
    get isCol() {
        return true;
    }
}
@view('/col')
export class ColView extends BlockView<Col>{
    render() {
        return <div className='sy-block-col' style={this.block.visibleStyle} ref={e => this.block.childsEl = e}>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}