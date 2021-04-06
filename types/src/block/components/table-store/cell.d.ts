/// <reference types="react" />
import { BaseComponent } from "../../base/component";
import { BlockAppear, BlockDisplay } from "../../base/enum";
import { Block } from "../../base";
import { TableStoreRow } from "./row";
import { TableStore } from "./table";
export declare class TableStoreCell extends Block {
    display: BlockDisplay;
    appear: BlockAppear;
    name: string;
    partName: string;
    get tableRow(): TableStoreRow;
    get tableStore(): TableStore;
    get col(): {
        name: string;
        width: number;
    };
    get metaCol(): import("./meta").TableFieldMeta;
    get value(): any;
    createCellContent(): Promise<void>;
    get isCol(): boolean;
}
export declare class TableStoreCellView extends BaseComponent<TableStoreCell> {
    render(): JSX.Element;
}
