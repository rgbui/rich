import { TableSchemaView } from "../../schema/meta";
import { FieldType } from "../../schema/type"
import { DataGridView } from "../../view/base";
import { CardView } from "./view";

import "./views/pin";
import "./views/article";
import "./views/events";
import "./views/tool";
import "./views/questions";
import "./views/rank";
import "./views/things";

export type CardPropsType = {
    url: string,
    group?: string,
    title: string,
    remark?: string,
    image: any,
    props?: { name: string, required?: boolean, text: string, types: FieldType[] }[],
    view?: typeof CardView,
    views?: Partial<TableSchemaView & { autoCreate?: boolean }>[],
    blockViewHandle?: (block: DataGridView, g: CardPropsType) => Promise<void>,
    dataList?: any[],
}
