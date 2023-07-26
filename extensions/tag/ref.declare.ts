import { LinkPageItem } from "../../src/page/declare"

export type BlockRefPage = LinkPageItem<{
    text: string,
    id: string,
    content: string,
    html: string,
    createDate: Date,
    elementUrl: string
}> & {
    spread?: boolean,
}