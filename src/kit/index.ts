
import { Page } from "../page";
import { Events } from "../../util/events";
import { Handle } from "./handle";
import { KitView } from "./view";
import "./style.less";
import { BlockPicker } from "./picker";
import { BoardLine } from "./connect/line";
import { BoardBlockHover } from "./connect/block.hover";
import { PageWrite } from "./write";
import { PageOperator } from "./operator";
import { Collaboration } from "./collaboration";
import { AnchorCursor } from "./anchor/cursor";
import { BoardSelector } from "./board.selector";
import { BoardMap } from "./scale/map";

export class Kit extends Events {
    page: Page;
    constructor(page: Page) {
        super();
        this.page = page;
        this.init();
    }
    init() {
        this.anchorCursor = new AnchorCursor(this);
        this.handle = new Handle(this);
        this.picker = new BlockPicker(this);
        this.boardLine = new BoardLine(this);
        this.writer = new PageWrite(this);
        this.operator = new PageOperator(this);
    }
    anchorCursor: AnchorCursor;
    writer: PageWrite;
    operator: PageOperator;
    handle: Handle;
    view: KitView;
    picker: BlockPicker;
    boardLine: BoardLine;
    boardBlockHover: BoardBlockHover;
    collaboration: Collaboration;
    boardSelector: BoardSelector;
    boardMap: BoardMap
}
