import { LinkPageItem } from "../../src/page/declare"

export type BlockRefPage = LinkPageItem & {
    spread?: boolean,
    childs: {
        text: string,
        id: string,
        content: string,
        html: string,
        createDate: Date,
        elementUrl: string
    }[]
}