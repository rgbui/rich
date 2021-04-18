
import { BaseComponent } from "../component";
import { Content } from "./content";
import { BlockAppear, BlockDisplay } from "../enum";
import { url, view } from "../../factory/observable";
import React from 'react';
import { ChildsArea } from "../appear";
@url('/col')
export class Col extends Content {
    display = BlockDisplay.block;
    appear = BlockAppear.layout;
    get isCol() {
        return true;
    }
}
@view('/col')
export class ColView extends BaseComponent<Col>{
    render() {
        return <div className='sy-block-col' style={this.block.visibleStyle} ref={e => this.block.childsEl = e}>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}