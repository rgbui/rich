import { Block } from "../../src/block";
import { url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import React from "react";
import { DotsSvg, LikeSvg, LinkSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { UserAvatars } from "../../component/view/avator/users";
import { FieldType } from "../data-grid/schema/type";
import { ElementType, getElementUrl } from "../../net/element.type";
import { channel } from "../../net/channel";
import lodash from "lodash";
import { BoxTip } from "../../component/view/tooltip/box";
import { S } from "../../i18n/view";
import { CopyAlert } from "../../component/copy";
import { lst } from "../../i18n/store";
import { QR } from "../../component/view/qr";

/***
 * 点赞或分享
 */
@url('/page/UpvotedOrShared')
export class UpvotedOrShared extends Block {
    async didMounted() {
        await this.loadEmojis();
    }
    async loadEmojis() {
        var elementUrl: string;
        if (this.page.formRowData) {
            elementUrl = getElementUrl(ElementType.SchemaFieldNameData,
                this.page.schema.id,
                FieldType[FieldType.like],
                this.page.formRowData.id
            )
        }
        else {
            elementUrl = getElementUrl(ElementType.PageItemEmoji, this.page.pageInfo.id, FieldType[FieldType.like])
        }
        var r = await channel.get('/user/interactives',
            {

                schemaId: this.page.schema?.id,
                ids: this.page.formRowData ? [this.page.formRowData.id] : [],
                ws: this.page.ws,
                es: [elementUrl]
            });
        if (r.ok) {
            this.userEmojis = r.data.list;
            this.forceUpdate();
        }
    }
    userEmojis: Record<string, string[]> = {};
}
@view('/page/UpvotedOrShared')
export class UpvotedOrSharedView extends BlockView<UpvotedOrShared>{
    async onLike() {
        var elementUrl: string;
        if (this.block.page.formRowData) {
            elementUrl = getElementUrl(ElementType.SchemaFieldNameData,
                this.block.page.schema.id,
                FieldType[FieldType.like],
                this.block.page.formRowData.id
            )
        }
        else {
            elementUrl = getElementUrl(ElementType.PageItemEmoji, this.block.page.pageInfo.id, FieldType[FieldType.like])
        }
        var r = await channel.patch('/interactive/emoji', {
            elementUrl: elementUrl,
            fieldName: FieldType[FieldType.like]
        });
        if (r.ok) {
            if (this.block.page.formRowData) {
                if (typeof this.block.page.formRowData[FieldType[FieldType.like]] == 'undefined') this.block.page.formRowData[FieldType[FieldType.like]] = { count: 0, users: [] };
                this.block.page.formRowData[FieldType[FieldType.like]].count = r.data.count;
                if (r.data.exists) this.block.page.formRowData[FieldType[FieldType.like]].users.push(this.block.page.user?.id)
                else lodash.remove(this.block.page.formRowData[FieldType[FieldType.like]].users, g => g == this.block.page.user?.id)
                if (r.data.exists) this.block.userEmojis.like.push(this.block.page.formRowData.id)
                else lodash.remove(this.block.userEmojis.like, g => g == this.block.page.formRowData.id)
            }
            else {
                if (typeof this.block.page.pageInfo) {
                    if (typeof this.block.page.pageInfo[FieldType[FieldType.like]] == 'undefined') this.block.page.pageInfo[FieldType[FieldType.like]] = { count: 0, users: [] };
                    this.block.page.pageInfo[FieldType[FieldType.like]].count = r.data.count;
                    if (r.data.exists) this.block.page.pageInfo[FieldType[FieldType.like]].users.push(this.block.page.user?.id)
                    else lodash.remove(this.block.page.pageInfo[FieldType[FieldType.like]].users, g => g == this.block.page.user?.id)
                    if (r.data.exists) this.block.userEmojis.like.push(this.block.page.pageInfo.id)
                    else lodash.remove(this.block.userEmojis.like, g => g == this.block.page.pageInfo.id)
                }
            }
            this.forceUpdate();
        }
    }
    renderView() {
        var likeCount = 0;
        var users: string[] = [];
        var isLike: boolean = false;
        if (this.block.page.formRowData) {
            var v = this.block.page.formRowData[FieldType[FieldType.like]];
            if (v) {
                likeCount = v.count;
                users = v.users;
                isLike = this.block.userEmojis?.like?.includes(this.block.page.formRowData.id)
            }
        }
        else if (this.block.page.pageInfo) {
            var v = this.block.page.pageInfo[FieldType[FieldType.like]];
            if (v) {
                likeCount = v.count;
                users = v.users;
                isLike = this.block.userEmojis?.like?.includes(this.block.page.pageInfo.id)
            }
        }
        return <div style={this.block.visibleStyle}>
            <div className="flex">
                <div className="flex-fixed flex">
                    <span onMouseDown={e => this.onLike()} className={"cursor flex-center  padding-w-10 h-30 round " + (isLike ? " border-primary bg-primary text-white" : " bg-p-light text-p")}><Icon size={20} icon={LikeSvg}></Icon>{likeCount > 0 && <span>{likeCount}</span>}</span>
                    <span className="gap-l-10"><UserAvatars size={28} users={users}></UserAvatars></span>
                </div>
                <div className="flex-auto flex-end r-flex-center r-size-30 r-round r-item-hover r-gap-l-5">
                    <BoxTip overlay={<div className="bg-white text r-padding-w-10 r-padding-h-5 r-flex">
                        <div className="flex item-hover " onMouseDown={e => CopyAlert(this.block.page.pageUrl, lst('已复制链接'))}><span className="flex-center size-20"><Icon size={18} icon={LinkSvg}></Icon></span><span className="gap-l-5"><S>复制链接</S></span></div>
                        <div className="flex item-hover "><span className="flex-center size-20"><Icon size={18} icon={{ name: 'bytedance-icon', code: "friends-circle" }}></Icon></span><span className="gap-l-5"><S>微信分享</S></span></div>
                        <div className="flex size-80">
                            <QR size={80} url={this.block.page.pageUrl}></QR>
                        </div>
                        {/* <div className="flex"  onMouseDown={e => { this.onWxShare('weibo') }}><span><Icon icon={{ name: 'bytedance-icon', code: "weibo" }}></Icon></span><S>微博分享</S></div> */}
                    </div>}>
                        <span className="cursor" ><Icon size={20} icon={{ name: 'bytedance-icon', code: "send" }}></Icon></span>
                    </BoxTip>
                    {this.block.isCanEdit() && <span className="cursor" onMouseDown={e => this.block.onContextmenu(e.nativeEvent)} ><Icon size={20} icon={DotsSvg}></Icon></span>}
                </div>
            </div>
        </div>
    }
}