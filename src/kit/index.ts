
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

export interface Kit {
    on(name: 'error', fn: (error: Error) => void);
    emit(name: 'error', error: Error);
    on(name: 'inputting', fn: (value: string, anchor: Anchor, options: { start?: number }) => void);
    emit(name: 'inputting', value: string, anchor: Anchor, options: { start?: number });
    on(name: 'keydown', fn: (event: KeyboardEvent) => boolean | void);
    emit(name: "keydown", event: KeyboardEvent): boolean | void;
    on(name: 'willInput', fn: () => void);
    emit(name: 'willInput');
    on(name: "mouseup", fn: (event: MouseEvent) => void);
    emit(name: 'mouseup', event: MouseEvent);
}