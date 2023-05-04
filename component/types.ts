


export type SearchListType<T = any, G ={}> = {
    list: T[],
    total: number,
    page: number,
    size: number,
    loading: boolean,
    word?: string,
    error?: string
} & G