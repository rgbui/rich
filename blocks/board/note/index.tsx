import React from "react";
import { ReactNode } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";

@url('/note')
export class Note extends Block {
    @prop()
    color: string = 'rgb(166, 204, 245)';
    @prop()
    isScale: boolean = true;
    @prop()
    fixedWidth: number = 200;
    @prop()
    fixedHeight: number = 200;
}
@view('/note')
export class NoteView extends BlockView<Note>{
    renderBg() {
        return <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter x="-18.8%" y="-120%" width="137.5%" height="340%" filterUnits="objectBoundingBox" id="aeqa">
                    <feGaussianBlur stdDeviation="2" in="SourceGraphic"></feGaussianBlur>
                </filter>
                <filter x="-9.4%" y="-60%" width="118.8%" height="220%" filterUnits="objectBoundingBox" id="aeqb">
                    <feGaussianBlur stdDeviation="1" in="SourceGraphic"></feGaussianBlur>
                </filter>
            </defs>
            <g fill="none" fill-rule="evenodd">
                <path fill="#353535" opacity=".5" filter="url(#aeqa)" d="M8 39h32v5H8z"></path>
                <path fill="#353535" opacity=".5" filter="url(#aeqb)" d="M8 39h32v5H8z"></path>
                <path fill={this.block.color} d="M4 4h40v40H4z"></path>
            </g>
        </svg>
    }
    render(): ReactNode {
        return <div className="sy-block-note" style={this.block.visibleStyle}>
            {this.renderBg()}
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}