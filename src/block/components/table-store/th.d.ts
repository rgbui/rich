/// <reference types="react" />
import { Block } from "../../base";
import { BaseComponent } from "../../base/component";
import { BlockAppear, BlockDisplay } from "../../base/enum";
import { TableStore } from "./table";
export declare class TableStoreTh extends Block {
    appear: BlockAppear;
    display: BlockDisplay;
    name: string;
    partName: string;
    get col(): {
        name: string;
        width: number;
    };
    get metaCol(): import("./meta").TableFieldMeta;
    get tableStore(): TableStore;
    get htmlContent(): {
        __html: string;
    };
    get isCol(): boolean;
}
export declare class TableStoreThView extends BaseComponent<TableStoreTh> {
    render(): JSX.Element;
}
