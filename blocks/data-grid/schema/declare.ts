export type SchemaFilter = {
    logic?: 'and' | 'or',
    field?: string,
    value?: any,
    operator?: string,
    items?: SchemaFilter[]
}