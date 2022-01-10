import { Kit } from "..";
import { Block } from "../../block";

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
    }
}