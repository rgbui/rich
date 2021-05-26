/// <reference types="react" />
import { Block } from "../..";
import { BaseComponent } from "../../base/component";
import "./style.less";
import { BlockAppear, BlockDisplay } from "../../base/enum";
import { Dragger } from "../../../common/dragger";
export declare class Table extends Block {
    appear: BlockAppear;
    display: BlockDisplay;
    cols: {
        width: number;
    }[];
}
export declare class TableView extends BaseComponent<Table> {
    mousemove(event: MouseEvent): void;
    didMount(): void;
    willUnmount(): void;
    sublineDragger: Dragger;
    table: HTMLTableElement;
    subline: HTMLElement;
    render(): JSX.Element;
}
