import React from "react";
import { ReactNode } from "react";
import { useSelectMenuItem } from "../../../../../component/view/menu";
import { MenuItemType } from "../../../../../component/view/menu/declare";
import { IconArguments } from "../../../../../extensions/icon/declare";
import { Rect } from "../../../../../src/common/vector/point";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import * as Card1 from "../../../../src/assert/img/card.1.png"
import { Button } from "../../../../../component/view/button";
import { Icon } from "../../../../../component/view/icon";
import { LoveSvg } from "../../../../../component/svgs";

CardModel({
    title: '',
    url: '/card/answer/list',
    image: Card1.default,
    props: [
        { name: 'author', text: '作者', types: [FieldType.creater] },
        { name: 'answer', text: '答案', types: [FieldType.text] },
        { name: 'like', text: '喜欢', types: [FieldType.like] },
        { name: 'like', text: '喜欢', types: [FieldType.oppose] },
        { name: 'like', text: '喜欢', types: [FieldType.love] },
        { name: 'comment', text: '评论', types: [FieldType.comment] }
    ]
})
@CardViewCom('/card/answer/list')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var author = this.getValue<string>('author');
        var answer = this.getValue<string>('answer');
        var love = this.getValue<string>('like');
        var isLove = this.isEmoji('like')
        return <div className="w100" >
            <div>
                <div>{author}</div>
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