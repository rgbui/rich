import React from 'react';
import { BlockDisplay } from "../enum";
import { url, view, prop } from "../factory/observable";
import { BlockView } from "../view";
import { ChildsArea } from "../view/appear";
import { Block } from "..";

@url('/col')
export class Col extends Block {
    display = BlockDisplay.block;
    get isCol() {
        return true;
    }
    @prop()
    widthPercent: number = 100;
    
}
@view('/col')
export class ColView extends BlockView<Col>{
    render() {
        var style = {
            width: (this.block.widthPercent || 100) + '%'
        }
        return <div className='sy-block-col' style={style} ref={e => this.block.childsEl = e}>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}