
import { BaseComponent } from "../component";
import { Content } from "./content";
import { BlockAppear, BlockDisplay } from "../enum";
import { url, view } from "../../factory/observable";
import React from 'react';
@url('/col')
export class Col extends Content {
    display = BlockDisplay.block;
    type =BlockAppear.layout;
}
@view('/col')
export class ColView extends BaseComponent<Col>{
    render() {
        return <div className='sy-block-col'>{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>
        )}</div>
    }
}