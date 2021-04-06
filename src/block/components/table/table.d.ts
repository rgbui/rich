/// <reference types="react" />
import { Block } from "../../base";
import { BaseComponent } from "../../base/component";
import "./style.less";
import { BlockAppear, BlockDisplay } from "../../base/enum";
export declare class Table extends Block {
    appear: BlockAppear;
    display: BlockDisplay;
}
export declare class TableView extends BaseComponent<Table> {
    render(): JSX.Element;
}
