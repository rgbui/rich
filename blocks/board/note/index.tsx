import React from "react";
import { ReactNode } from "react";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";

@url('/note')
export class Note extends Block {

}
@view('/note')
export class NoteView extends BlockView<Note>{
    render(): ReactNode {
        return <div className="sy-block-note" style={this.block.visibleStyle}>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}