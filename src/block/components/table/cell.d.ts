/// <reference types="react" />
import { BaseComponent } from "../../base/component";
import { BlockAppear, BlockDisplay } from "../../base/enum";
import { Block } from "../../base";
export declare class TableCell extends Block {
    rowspan: number;
    colspan: number;
    display: BlockDisplay;
    appear: BlockAppear;
    partName: string;
    get isLayout(): boolean;
    get isText(): boolean;
    get isSolid(): boolean;
    get isCol(): boolean;
}
export declare class TableCellView extends BaseComponent<TableCell> {
    render(): JSX.Element;
}
