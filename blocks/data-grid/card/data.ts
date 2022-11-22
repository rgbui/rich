import * as Card1 from "../../../src/assert/img/card.1.png"
import { FieldType } from "../schema/type"

export type CardPropsType = {
    url: string,
    title: string,
    remark?: string,
    image: any,
    props?: { name: string, text: string, types: FieldType[] }[]
}
class CardStores {
    data: CardPropsType[] = [];
    constructor() {
        this.init()
    }
    init() {
        this.data = [
            {
                url: '/card/pinterest',
                title: 'Pinterest瀑布流的形式展现图片内容',
                remark: '适用于摄影等图像展示',
                image: Card1.default,
                props: [
                    {
                        name: 'cover',
                        text: '封面图',
                        types: [FieldType.image, FieldType.video]
                    },
                    { name: 'author', text: '作者', types: [FieldType.creater] },
                    { name: 'title', text: '标题', types: [FieldType.title, FieldType.text] },
                    { name: 'remark', text: '描述', types: [FieldType.text] },
                    { name: 'like', text: '喜欢', types: [FieldType.like] }
                ]
            },
            {
                url: '/card/pinterest-1',
                title: '现图片内容',
                remark: '适用于摄影等图像展示',
                image: Card1.default,
                props: []
            }
        ]
    }
    get() {
        return this.data;
    }
}
export var cardStores = new CardStores()


