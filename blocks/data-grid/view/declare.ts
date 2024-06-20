export type GroupViewType = {
    groupId: string,
    abled: boolean,
    by: 'exact' | 'alphabetical' | 'year' | 'week' | 'day' | 'month',
    number: {
        by: 'interval' | 'custom',
        min: number,
        max: number,
        step: number,
        customs: { min: number, max: number, text: string }[]
    }
    hideEmptyGroup: boolean,
    hideGroups: GroupIdType[],
    sort: 'asc' | 'desc',
    stat: string,
    statFieldId: string

}
export type GroupIdType = string | null | Date | { min: number, max: number } | number

export type GroupHeadType={ id: GroupIdType, spread: boolean, text: string, value: GroupIdType, count?: number | Date, total?: number | Date }