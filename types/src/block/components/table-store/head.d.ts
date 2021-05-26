/// <reference types="react" />
import { Block } from "../..";
import { BaseComponent } from "../../base/component";
import { BlockAppear, BlockDisplay } from "../../base/enum";
import { TableStore } from "./table";
export declare class TableStoreHead extends Block {
    appear: BlockAppear;
    display: BlockDisplay;
    get isRow(): boolean;
    partName: string;
    get tableStore(): TableStore;
    appendTh(at: number): Promise<void>;
}
export declare class TableStoreHeadView extends BaseComponent<TableStoreHead> {
    render(): JSX.Element;
}
