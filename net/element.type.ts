
export class SchemaName {
    UserDefineDataSchemaViewTemplate = 'UserDefineDataSchemaViewTemplate'
}

export enum ElementType {
    PageItem,
    Block,
    Schema,
    SchemaRecord,
    SchemaView,
    SchemaRecordView,
    SchemaRecordField
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
export function getElementUrl(type: ElementType, id: string, id1?: string, id2?: string) {
    if (type == ElementType.SchemaRecord) return ` /Schema/${id}/Record/${id1}`
    else if (type == ElementType.SchemaView) return `/Schema/${id}/View/${id1}`
    else if (type == ElementType.SchemaRecordView) return `/Schema/${id}/RecordView/${id1}`
    else if (type == ElementType.SchemaRecordField) return `/Schema/${id}/Field/${id1}/Record/${id2}`
    else return `/${ElementType[type]}/${id}`
}

export function parseElementUrl(url: string) {
    var us = url.split(/\//g);
    us.removeAll(g => g ? false : true);
    if (us.includes('Field')) {
        us.removeAll(g => g == 'Schema' || g == 'Field' || g == 'Record')
        return {
            type: ElementType.SchemaRecordField,
            id: us[0],
            id1: us[1],
            id2: us[2]
        }
    }
    else if (us.includes('Schema')) {
        if (us.includes('Record')) {
            return {
                type: ElementType.SchemaRecord,
                id: us[0],
                id1: us[1]
            }
        }
        else if (us.includes('RecordView')) {
            return {
                type: ElementType.SchemaRecordView,
                id: us[0],
                id1: us[1]
            }
        }
        else if (us.includes('View')) {
            return {
                type: ElementType.SchemaView,
                id: us[0],
                id1: us[1]
            }
        }
    }
    else if (us.includes('Block')) {
        us.removeAll(g => g == 'Block')
        return {
            type: ElementType.Block,
            id: us[0]
        }
    }
    else if (us.includes('PageItem')) {
        us.removeAll(g => g == 'PageItem')
        return {
            type: ElementType.Block,
            id: us[0]
        }
    }
}