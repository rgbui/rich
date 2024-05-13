

import React from "react";
import { SearchListType } from "../../component/types";
import { ResourceArguments } from "../icon/declare";
import { Pagination } from "../../component/view/pagination";
import { Spin } from "../../component/view/spin";
import { S } from "../../i18n/view";
import { channel } from "../../net/channel";
import { lst } from "../../i18n/store";
import { util } from "../../util/util";
import { autoImageUrl } from "../../net/element.type";
import { ToolTip } from "../../component/view/tooltip";
import dayjs from "dayjs";
import { Avatar } from "../../component/view/avator/face";

export class LastUploadFiles extends React.Component<{
    fileClassify?: 'cover',
    mime?: 'image',
    onChange: (resource: ResourceArguments) => void
}> {
    slist: SearchListType<ResourceArguments> = {
        total: 0,
        list: [],
        page: 1,
        size: 48,
        loading: false,
        word: ''
    };
    async load(fileClassify?: 'cover') {
        this.slist.loading = true;
        this.slist.error = '';
        this.forceUpdate();
        try {
            var r = await channel.get('/ws/files', {
                mime: this.props.mime || 'image',
                page: this.slist.page,
                size: this.slist.size,
                fileClassify: fileClassify || this.props.fileClassify
            });
            if (r?.ok) {
                this.slist.list = r.data.list;
                this.slist.total = r.data.total;
                this.slist.page = r.data.page;
                this.slist.size = r.data.size;
            }
            else throw new Error('load fail')
        }
        catch (e) {
            this.slist.error = lst('加载失败');
            this.slist.list = [];
            this.slist.page = 1;
            this.slist.total = 0;
        }
        finally {
            this.slist.loading = false;
            this.forceUpdate();
        }
    }
    renderItem(item: ResourceArguments, index: number) {
        return <div style={{ width: 'calc(25% - 15px)' }} onMouseDown={e => this.props.onChange(item)} className="gap-l-5 padding-5 gap-b-5 item-hover  round cursor" key={index}>
            <ToolTip overlay={<div className="f-12 l-20 text-1">
                <div><S>创建人</S>:<Avatar userid={item.creater} size={24}></Avatar></div>
                <div><S>文件名</S>:{item.filename}</div>
                <div><S>大小</S>:{util.byteToString(item.size)}</div>
                <div><S>创建时间</S>:{dayjs(item.createDate).format('YYYY-MM-HH')}</div>
            </div>}><img className="obj-center w100  h-80 round " src={autoImageUrl(item.url, 250)} /></ToolTip>
            <div className="h-20 f-12  w100  flex"><span className="flex-auto text-overflow text-1">{item.filename}</span>{item.createDate && <span className="flex-fixed remark">{util.showTime(typeof item.createDate == 'number' ? new Date(item.createDate) : item.createDate as any)}</span>}</div>
        </div>
    }
    render() {
        return <div className="padding-h-10 padding-l-5 padding-r-10 max-h-400 overflow-y">

            {this.slist.loading && <Spin gap={30} block></Spin>}
            {!this.slist.loading && <div>
                {this.slist.list.length == 0 && <div
                    className="flex-center f-12 remark"><S>暂无上传记录</S></div>}
                {this.slist.list.length > 0 && <div className="flex flex-wrap">
                    {this.slist.list.map((l, i) => {
                        return this.renderItem(l, i);
                    })}
                </div>}
            </div>}
            <Pagination
                gap={20}
                size={this.slist.size}
                index={this.slist.page}
                total={this.slist.total} onChange={(i, s) => {
                    this.slist.page = i;
                    this.slist.size = s;
                    this.load();
                }}></Pagination>
        </div>
    }
}