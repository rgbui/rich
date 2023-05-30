


export type SearchListType<T = any, G ={}> = {
    list: T[],
    lastDate?:Date,
    total: number,
    page?: number,
    size: number,
    loading?: boolean,
    word?: string,
    error?: string
} & G