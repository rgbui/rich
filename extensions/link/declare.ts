

export type PageLink = {
    name: 'outside' | 'page' | 'create',
    url?: string,
    pageId?: string,
    blockId?: string,
    target?: "_blank" | "_self"
}