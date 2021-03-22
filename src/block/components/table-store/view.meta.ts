import { util } from "../../../util/util";


export enum TableMetaFieldType {
    string,
    number,
    date,
    select,
    users,
    file,
    url,
    checkbox,
    rich,
    phone,
    email,
    relation
}
export class TableMeta {
    constructor(data) {
        for (var n in data) {
            this[n] = data[n];
        }
    }
    id: string
    date: number
    cols: {
        name: string,
        text: string,
        type: TableMetaFieldType,
        isKey?: boolean,
        isParentKey?: boolean,
        isChildKey?: boolean
    }[]
    get() {
        var json: Record<string, any> = { id: this.id, date: this.date };
        json.cols = this.cols.map(col => {
            return Object.assign({}, util.clone(col));
        });
        return json;
    }
}

