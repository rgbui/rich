import lodash from "lodash"

export type SchemaFilter = {
    id?: string,
    logic?: 'and' | 'or',
    field?: string,
    value?: any,
    operator?: string,
    items?: SchemaFilter[]
}


export function SchemaFilterJoin(firstFilter: SchemaFilter,
    secondFilter: SchemaFilter,
    logic: SchemaFilter['logic'] = 'and'): SchemaFilter {
    firstFilter = lodash.cloneDeep(firstFilter)
    secondFilter = lodash.cloneDeep(secondFilter)
    if (!secondFilter) return firstFilter
    if (!firstFilter) return secondFilter

    if (firstFilter.logic == 'and' || firstFilter.logic == 'or') {
        if (logic == 'and') {
            if (secondFilter.logic == 'and')
                firstFilter.items.push(...(secondFilter.items || []))
            else
                firstFilter.items.push(secondFilter)
        }
        else if (logic == 'or') {
            if (secondFilter.logic == 'or')
                firstFilter.items.push(...(secondFilter.items || []))
            else
                firstFilter.items.push(secondFilter)
        }
    }
    else {
        if (logic == 'and') {
            firstFilter = {
                logic: 'and',
                items: [firstFilter]
            }
            if (secondFilter.logic == 'and')
                firstFilter.items.push(...(secondFilter.items || []))
            else
                firstFilter.items.push(secondFilter)
        }
        else if (logic == 'or') {
            firstFilter = {
                logic: 'or',
                items: [firstFilter]
            }
            if (secondFilter.logic == 'or')
                firstFilter.items.push(...(secondFilter.items || []))
            else
                firstFilter.items.push(secondFilter)
        }
    }
    return firstFilter;


}