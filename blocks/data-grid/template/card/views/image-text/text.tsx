import { CardModel, CardViewCom } from "../../factory/observable";
import * as Card1 from "../../../../../../src/assert/img/card/card1.png"
import { ReactNode } from "react";
import { LoveSvg } from "../../../../../../component/svgs";
import { Button } from "../../../../../../component/view/button";
import { FieldType } from "../../../../schema/type";
import { CardView } from "../../view";
import React from "react";
import { Icon } from "../../../../../../component/view/icon";

CardModel({
    title: '',
    url: '/image-text/1',
    image: Card1.default,
    group: 'image-text',
    props: [
        { name: 'author', text: '作者', types: [FieldType.creater] },
        { name: 'title', text: '标题', types: [FieldType.title, FieldType.text] },
        { name: 'answer', text: '描述', types: [FieldType.text] },
        { name: 'like', text: '喜欢', types: [FieldType.like] },
        { name: 'like', text: '喜欢', types: [FieldType.oppose] },
        { name: 'like', text: '喜欢', types: [FieldType.love] },
        { name: 'comment', text: '评论', types: [FieldType.comment] }
    ]
})
@CardViewCom('/image-text/1')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var author = this.getValue<string>('author');
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('answer');
        var love = this.getValue<string>('like');
        var isLove = this.isEmoji('like')
        return <div className="w100" >
            <div>
                <div><a>{title}</a></div>
                <div>{remark}</div>
            </div>
            <div>
                <Button></Button>
                <Button></Button>
                <span><Icon icon={LoveSvg}></Icon><em></em></span>
            </div>
            <div>

            </div>
        </div>
    }
} 