
import { Page } from "../page";
import { Events } from "../../util/events";
import { Handle } from "./handle";
import { Selector } from "./selector";
import { KitView } from "./view";
import "./style.less";
import { BlockPicker } from "./picker";
import { BoardLine } from "./connect/line";
import { BoardBlockHover } from "./connect/block.hover";
import { PageWrite } from "./write";
import { PageOperator } from "./operator";
import { Collaboration } from "./collaboration";

export class Kit extends Events {
    page: Page;
    constructor(page:Page) {
        super();
        this.page = page;
        this.init();
    }
    init() {
        this.selector = new Selector(this);
        this.handle = new Handle(this);
        this.picker = new BlockPicker(this);
        this.boardLine = new BoardLine(this);
        this.writer = new PageWrite(this);
        this.operator = new PageOperator(this);
    }
    writer: PageWrite;
    operator: PageOperator;
    selector: Selector;
    handle: Handle;
    view: KitView;
    picker: BlockPicker;
    boardLine: BoardLine;
    boardBlockHover: BoardBlockHover;
    collaboration: Collaboration
}
