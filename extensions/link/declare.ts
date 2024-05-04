

export type PageLink = {
    name?: 'outside' | 'page' | 'create'|'none',
    url?: string,
    text?:string,
    pageId?: string,
    blockId?: string,
    target?: "_blank" | "_self"
}