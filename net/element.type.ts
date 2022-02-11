
export class SchemaName {
    UserDefineDataSchemaViewTemplate = ' UserDefineDataSchemaViewTemplate'
}

export enum ElementType {
    PageItem,
    Block,
    Schema,
    SchemaRecord,
    SchemaView,
    SchemaRecordView
}

/***
 *
/PageItem/id
/Block/id
/Schema/id
/Schema/id/Record/id
/Schema/id/View/id
/Schema/id/RecordView/id
 */
export function getElementUrl(type: ElementType, parentId: string, id?: string) {
    if (type == ElementType.SchemaRecord) return ` /Schema/${parentId}/Record/${id}`
    else if (type == ElementType.SchemaView) return `/Schema/${parentId}/View/${id}`
    else if (type == ElementType.SchemaRecordView) return `/Schema/${parentId}/RecordView/${id}`
    else return `/${ElementType[type]}/${parentId}`
}