/// <reference types="react" />
import { Block } from "../..";
import { BaseComponent } from "../../base/component";
import { BlockAppear, BlockDisplay } from "../../base/enum";
import { TableStore } from "./table";
export declare class TableStoreRow extends Block {
    appear: BlockAppear;
    display: BlockDisplay;
    get isRow(): boolean;
    partName: string;
    get tableStore(): TableStore;
    dataRow: Record<string, any>;
    createCells(): Promise<void>;
    appendCell(at: number): Promise<void>;
}
export declare class TableRowView extends BaseComponent<TableStoreRow> {
    render(): JSX.Element;
}
