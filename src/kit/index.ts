
import { Page } from "../page";
import { Events } from "../../util/events";
import { Handle } from "./handle";
import { TextInput } from "./input";
import { SelectionExplorer } from "./selection/explorer";
import { Selector } from "./selector";
import { KitView } from "./view";
import "./style.less";
import { PageMouse } from "./mouse";
import { BlockPicker } from "./picker";
import { PageBoard } from "./mouse/board";
export class Kit extends Events {
    page: Page;
    constructor(page: Page) {
        super();
        this.page = page;
        this.init();
    }
    init() {
        this.selector = new Selector(this);
        this.explorer = new SelectionExplorer(this);
        this.textInput = new TextInput(this);
        this.mouse = new PageMouse(this);
        this.board=new PageBoard(this);
        this.handle = new Handle(this);
        this.picker=new BlockPicker(this);
    }
    mouse: PageMouse;
    board:PageBoard;
    textInput: TextInput;
    selector: Selector;
    explorer: SelectionExplorer;
    handle: Handle;
    view: KitView;
    picker:BlockPicker;
}
