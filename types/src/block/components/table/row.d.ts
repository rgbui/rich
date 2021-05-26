/// <reference types="react" />
import { BaseComponent } from "../../base/component";
import { Block } from "../..";
import { BlockAppear, BlockDisplay } from "../../base/enum";
export declare class TableRow extends Block {
    appear: BlockAppear;
    display: BlockDisplay;
    partName: string;
    get isRow(): boolean;
}
export declare class TableRowView extends BaseComponent<TableRow> {
    render(): JSX.Element;
}
