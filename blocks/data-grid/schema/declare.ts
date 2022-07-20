export type SchemaFilter = {
    id?:string,
    logic?: 'and' | 'or',
    field?: string,
    value?: any,
    operator?: string,
    items?: SchemaFilter[]
}