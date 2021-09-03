import React from "react";
import { Block } from "../../../src/block";
import { url, view } from "../../../src/block/factory/observable";
import { ChildsArea } from "../../../src/block/view/appear";
import { BlockView } from "../../../src/block/view";
@url('/list/sub/panel')
export class ListSubPanel extends Block {
    partName = 'subPanel';
    get isCol() {
        return true;
    }
}
@view('/list/sub/panel')
export class ListTextView extends BlockView<ListSubPanel>{
    render() {
        return <ChildsArea childs={this.block.childs}></ChildsArea>
    }
}