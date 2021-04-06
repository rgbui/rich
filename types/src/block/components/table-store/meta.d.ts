export declare enum TableMetaFieldType {
    string = 0,
    number = 1,
    date = 2,
    select = 3,
    users = 4,
    file = 5,
    url = 6,
    checkbox = 7,
    rich = 8,
    phone = 9,
    email = 10,
    relation = 11
}
export declare class TableMeta {
    constructor(data: any);
    id: string;
    date: number;
    cols: TableFieldMeta[];
    get(): Record<string, any>;
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
