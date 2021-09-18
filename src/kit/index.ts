
import { Page } from "../page";
import { Events } from "../../util/events";
import { Handle } from "./handle";
import { TextInput } from "./input";
import { Anchor } from "./selection/anchor";
import { SelectionExplorer } from "./selection/explorer";
import { Selector } from "./selector";
import { KitView } from "./view";
import "./style.less";
import { PageMouse } from "./mouse";
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
        this.handle = new Handle(this);
    }
    mouse: PageMouse;
    textInput: TextInput;
    selector: Selector;
    explorer: SelectionExplorer;
    handle: Handle;
    view: KitView;
}
