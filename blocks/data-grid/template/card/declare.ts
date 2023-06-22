import { TableSchemaView } from "../../schema/meta";
import { FieldType } from "../../schema/type"
import { DataGridView } from "../../view/base";
import { CardView } from "./view";

import "./views/pin";
import "./views/article";
import "./views/events";
import "./views/tool";
import "./views/things";
import "./views/tizhi";
import "./views/disk";

import "./views/issue";
import "./views/questions";
import "./views/rank";

export type CardPropsType = {
    url: string,
    title: string,
    abled?: boolean,
    remark?: string,
    image: any,
    forUrls?: string[],
    props?: { name: string, required?: boolean, text: string, types: FieldType[] }[],
    view?: typeof CardView,
    views?: Partial<TableSchemaView & { autoCreate?: boolean }>[],
    blockViewHandle?: (block: DataGridView, g: CardPropsType) => Promise<void>,
    dataList?: any[],
    createDataList?(): Promise<any[]>
}
