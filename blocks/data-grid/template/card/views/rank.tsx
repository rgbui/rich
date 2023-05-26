import React, { ReactNode } from "react";
import { Avatar } from "../../../../../component/view/avator/face";
import { UserBox } from "../../../../../component/view/avator/user";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import * as Card1 from "../../../../../src/assert/img/card/card1.png"
import { BlockUrlConstant } from "../../../../../src/block/constant";

/**
 * 
 * https://segmentfault.com/users
 * 
 * 
 */
CardModel({
    url: '/rank',
    title: '排行榜',
    remark: '排行榜',
    image: Card1.default,
    group: 'image',
    props: [
        { name: 'user', text: '用户', types: [FieldType.user] },
        { name: 'score', text: '分类', types: [FieldType.number] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: '排行', },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: '排行榜', },
        { url: BlockUrlConstant.RecordPageView, text: '排行详情', }
    ],
    dataList: [
        { score: 20 },
        { score: 10 },
        { score: 20 },
        { score: 30 },
        { score: 40 },
        { score: 50 },
    ],
    async blockViewHandle(dg, g) {
        var ps = g.props.toArray(pro => {
            var f = dg.schema.fields.find(x => x.text == pro.text);
            if (f) {
                return {
                    name: f.name,
                    visible: true,
                    bindFieldId: f.id
                }
            }
        })
        await dg.updateProps({
            openRecordSource: 'page',
            cardConfig: {
                auto: false,
                showCover: false,
                coverFieldId: "",
                coverAuto: false,
                showMode: 'define',
                templateProps: {
                    url: g.url,
                    props: ps
                }
            }
        });
    }
})

@CardViewCom('/rank')
export class CardPin extends CardView {
    render() {
        var user = this.getValue<string>('user');
        var score = this.getValue<string>('score');
        return <div>
            <div className="flex">
                <div className="flex-fixed">{this.getRowIndex() + 1}</div>
                <div className="flex-auto">
                    <UserBox userid={user}>{(user) => {
                        return <>
                            <Avatar size={30} user={user}></Avatar>
                            <a className="cursor gap-l-10 underline-hover text-1">{user.name}</a>
                        </>
                    }}</UserBox>
                </div>
                <div className="flex-fixed">{score}</div>
            </div>
        </div>

    }
} 