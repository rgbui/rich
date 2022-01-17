
type DataDimension = {
    fieldId?: string,
    express?: string,
    aggregate?: string,
}
//http://demo.finebi.com/decision/v5/design/report/8c7e24f1a13444ce8fe0cce4b6c1401f/edit
export type EchartOption = {
    schemaId: string,
    rows: DataDimension[],
    columns: DataDimension[],
    filters: Record<string, any>[]
}