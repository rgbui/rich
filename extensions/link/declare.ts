

export type PageLink = {
    name?: 'outside' | 'page' | 'create' | 'none',
    url?: string,
    text?: string,
    pageId?: string,
    blockId?: string,
    target?: "_blank" | "_self"
}

/**
 * 引用的其它资源
 */
export type RefPageLink = {
    id: string,
    type: 'page' | "tag" | "comment" | "mention",
    pageId?: string,
    tagId?: string,
    tagText?:string,
    commentId?: string,
    userid?: string,
}

/***
 * 块引用其它资源 其中id来源RefPageLink,因为一个块可以引用多个资源
 * 块:{pageId,blockId}
 * 链接:ref RefPageLink
 * elementUrl:块元素的地址  类型为ElementType.Block
 * text,html:块的内容文本
 * date：表示@mention某人的时间
 */
export type BlockRefPageLink = {
    id: string,
    op?: 'delete' | 'sync',
    type: "page" | "tag" | "comment" | "mention",
    ref: RefPageLink,
    elementUrl?: string,
    text?: string,
    html?: string,
    date?: number,
    blockId?: string
}


