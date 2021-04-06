/// <reference types="react" />
import { Block } from "../../base";
import { BaseComponent } from "../../base/component";
import { TableMeta } from "./meta";
import "./style.less";
import { BlockAppear, BlockDisplay } from "../../base/enum";
/***
 * 数据总共分三部分
 * 1. 数据源（调用第三方接口获取数据），编辑的数据源需要触发保存
 * 2. 表格的元数据信息（来源于全局的表格元数据信息)
 * 3. 表格的视图展示（具体到视图的展现,信息存在tableStore）
 */
export declare class TableStore extends Block {
    meta: TableMeta;
    cols: {
        name: string;
        width: number;
    }[];
    data: any[];
    pagination: boolean;
    load(data: any): Promise<void>;
    loadHeads(): Promise<void>;
    loadRows(): Promise<void>;
    get(): Promise<Record<string, any>>;
    appear: BlockAppear;
    display: BlockDisplay;
}
export declare class TableStoreView extends BaseComponent<TableStore> {
    renderHead(): JSX.Element;
    renderBody(): JSX.Element;
    renderFooter(): JSX.Element;
    render(): JSX.Element;
}
