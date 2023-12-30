import lodash from "lodash"
import { Field } from "./field"
import { FieldType } from "./type"

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

export function getFieldFilterUrl(field: Field) {
    var url: string = '/field/filter/null';
    if ([FieldType.bool].includes(field.type)) {
        url = '/field/filter/check';
    }
    else if ([FieldType.image, FieldType.comment, FieldType.like, FieldType.video, FieldType.audio, FieldType.file].includes(field.type)) {
        url = '/field/filter/null';
    }
    else if ([FieldType.createDate, FieldType.modifyDate, FieldType.date].includes(field.type)) {
        url = '/field/filter/date';
    }
    else if ([FieldType.creater, FieldType.modifyer, FieldType.user].includes(field.type)) {
        url = '/field/filter/user';
    }
    else if ([FieldType.option, FieldType.options].includes(field.type)) {
        url = '/field/filter/option';
    }
    else if ([FieldType.relation].includes(field.type)) {
        url = '/field/filter/relation';
    }
    else if ([FieldType.number].includes(field.type)) {
        url = '/field/filter/number';
    }
    else if ([
        FieldType.id,
        FieldType.title,
        FieldType.text,
        FieldType.email,
        FieldType.phone,
        FieldType.link
    ].includes(field.type)) {
        url = '/field/filter/search';
    }
    return url;
}