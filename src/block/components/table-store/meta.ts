import { util } from "../../../util/util";


export enum TableMetaFieldType {
    string,
    number,
    date,
    select,
    multipleSelect,
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
            if (n == 'cols') continue;
            this[n] = data[n];
        }
        if (Array.isArray(data.cols))
            data.cols.each(col => {
                var field = new TableFieldMeta();
                field.load(col);
                this.cols.push(field);
            })
    }
    id: string
    date: number
    cols: TableFieldMeta[] = [];
    get() {
        var json: Record<string, any> = { id: this.id, date: this.date };
        json.cols = this.cols.map(g => g.get());
        return json;
    }
    createNewName() {
        var i = 1;
        var prefix = 's';
        while (true) {
            if (this.cols.exists(c => c.name == prefix + i)) {
                i += 1;
            }
            else return prefix + i;
        }
    }
    createNewText(){
        var i = 1;
        var prefix = '列';
        while (true) {
            if (this.cols.exists(c => c.text== prefix + i)) {
                i += 1;
            }
            else return prefix + i;
        }
    }
    static createFieldMeta(fieldMeta: Partial<TableFieldMeta>) {
        var tf = new TableFieldMeta();
        tf.load(fieldMeta);
        return tf;
    }
}
export class TableFieldMeta {
    name: string
    text: string
    type: TableMetaFieldType
    isKey?: boolean
    isParentKey?: boolean
    isChildKey?: boolean;
    load(col: Record<string, any>) {
        for (var n in col) {
            if (n == 'type') {
                if (typeof col.type == 'string') {
                    col.type = TableMetaFieldType[col.type] as any;
                }
                this.type = col[n];
            }
            else this[n] = col[n];
        }
    }
    get() {
        return {
            name: this.name,
            text: this.text,
            type: this.type,
            isKey: this.isKey,
            isParentKey: this.isParentKey,
            isChildKey: this.isChildKey
        }
    }
}

