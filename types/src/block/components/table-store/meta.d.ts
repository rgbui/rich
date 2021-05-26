export declare enum TableMetaFieldType {
    string = 0,
    number = 1,
    date = 2,
    select = 3,
    multipleSelect = 4,
    users = 5,
    file = 6,
    url = 7,
    checkbox = 8,
    rich = 9,
    phone = 10,
    email = 11,
    relation = 12
}
export declare class TableMeta {
    constructor(data: any);
    id: string;
    date: number;
    cols: TableFieldMeta[];
    get(): Record<string, any>;
    createNewName(): string;
    createNewText(): string;
    static createFieldMeta(fieldMeta: Partial<TableFieldMeta>): TableFieldMeta;
}
export declare class TableFieldMeta {
    name: string;
    text: string;
    type: TableMetaFieldType;
    isKey?: boolean;
    isParentKey?: boolean;
    isChildKey?: boolean;
    load(col: Record<string, any>): void;
    get(): {
        name: string;
        text: string;
        type: TableMetaFieldType;
        isKey: boolean;
        isParentKey: boolean;
        isChildKey: boolean;
    };
}
