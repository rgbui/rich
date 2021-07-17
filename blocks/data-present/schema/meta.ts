import { Field } from "./field";
export class TableMeta {
    constructor(data) {
        for (var n in data) {
            if (n == 'cols') continue;
            this[n] = data[n];
        }
        if (Array.isArray(data.cols))
            data.cols.each(col => {
                var field = new Field();
                field.load(col);
                this.cols.push(field);
            })
    }
    id: string
    creater: string;
    createDate: Date;
    cols: Field[] = [];
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
    createNewText() {
        var i = 1;
        var prefix = '列';
        while (true) {
            if (this.cols.exists(c => c.text == prefix + i)) {
                i += 1;
            }
            else return prefix + i;
        }
    }
    static createFieldMeta(fieldMeta: Partial<Field>) {
        var tf = new Field();
        tf.load(fieldMeta);
        return tf;
    }
}


