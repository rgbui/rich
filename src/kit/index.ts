import { Block } from "../block";
import { Point } from "../common/point";
import { Page } from "../page";
import { Events } from "../../util/events";
import { Bar } from "./handle";
import { DropDirection } from "./handle/direction";
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
        this.bar = new Bar(this);
    }
    mouse: PageMouse;
    textInput: TextInput;
    selector: Selector;
    explorer: SelectionExplorer;
    bar: Bar;
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
    on(name: "openMenu", fn: (blocks: Block[], event: MouseEvent) => void);
    emit(name: 'openMenu', blocks: Block[], event: MouseEvent)
    on(name: 'dragMoveBlocks', fn: (blocks: Block[], drop: Block, direction: DropDirection) => void);
    emit(name: "dragMoveBlocks", blocks: Block[], drop: Block, direction: DropDirection)
}