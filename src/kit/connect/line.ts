import React from "react";
import { Kit } from "..";
import { Block } from "../../block";
import { BoardBlockSelector } from "../../block/partial/board";

export class BoardLine {
    constructor(public kit: Kit) { }
    isConnectOther: boolean = false;
    line: Block;
    onStartConnectOther(line:Block) {
        this.line=line;
        this.isConnectOther = true;
        var gm = this.line.panelGridMap;
        gm.start();
    }
    onEndConnectOther() {
        this.isConnectOther = false;
        var gm = this.line.panelGridMap;
        gm.over();
        delete this.line;
        this.over = null;
    }
    over: { block: Block, selector: BoardBlockSelector, event: React.MouseEvent } = null;
}