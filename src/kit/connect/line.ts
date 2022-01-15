import React from "react";
import { Kit } from "..";
import { Block } from "../../block";
import { BoardBlockSelector } from "../../block/partial/board";

export class BoardLine {
    constructor(public kit: Kit) { }
    isConnectOther: boolean = false;
    line: Block;
    onStartConnectOther() {
        this.isConnectOther = true;
    }
    onEndConnectOther() {
        this.isConnectOther = false;
        delete this.line;
        this.over=null;
    }
    over: { block: Block, selector: BoardBlockSelector,event:React.MouseEvent } = null;
}