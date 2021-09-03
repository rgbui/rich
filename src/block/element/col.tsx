


import React from 'react';
import { BlockDisplay } from "../enum";
import { url, view } from "../factory/observable";
import { BlockView } from "../view";
import { ChildsArea } from "../view/appear";
import { Block } from "..";

@url('/col')
export class Col extends Block {
    display = BlockDisplay.block;
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