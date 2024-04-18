import { TableSchemaView } from "../../schema/meta";
import { FieldType } from "../../schema/type"
import { DataGridView } from "../../view/base";
import { CardView } from "./view";

import "./views/article";
import "./views/pin";
import "./views/vote";
import "./views/disk";
import "./views/user.card";
import "./views/goods";
import "./views/job";
import "./views/rank";
import "./views/things";

import { Block } from "../../../../src/block";
import { FieldConfig } from "../../schema/field";

export type CardPropsType = {
    url: string,
    title: string,
    abled?: boolean,
    remark?: string,
    image?: any,
    /**
     * 自定义菜单显示时使用
     * @param g 
     * @returns 
     */
    renderItem?: (g: CardPropsType) => Promise<JSX.Element>,
    renderSettings?: (block: Block, g: CardPropsType) => Promise<JSX.Element>,
    forUrls?: string[],
    props?: {
        name: string,
        required?: boolean,
        text: string,
        types: FieldType[],
        config?: FieldConfig
    }[],
    view?: typeof CardView,
    views?: Partial<TableSchemaView & { autoCreate?: boolean }>[],
    createViews?: () => Promise<Partial<TableSchemaView & { autoCreate?: boolean }>[]>,
    blockViewHandle?: (block: DataGridView, g: CardPropsType) => Promise<void>,
    dataList?: any[],
    createDataList?(): Promise<any[]>
}
