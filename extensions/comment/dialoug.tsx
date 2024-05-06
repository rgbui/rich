import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { CommentListView } from "./list";
import { LinkWs } from "../../src/page/declare";
import { Button } from "../../component/view/button";
import { S } from "../../i18n/view";
import { channel } from "../../net/channel";

export class CommentDialoug extends EventsComponent {
    render() {
        return <div className="w-500 padding-10 ">
            {this.resolvedHtml && <div className="gap-b-10 padding-w-10 flex border round">
                <div className="flex-auto gap-r-20 gap-h-5 padding-h-3 padding-l-10 text-1" style={{ borderLeft: '2px solid var(--text-p-color)' }} >
                    <div className="row-2" dangerouslySetInnerHTML={{ __html: this.resolvedHtml }}></div>
                </div>
                <div className="flex-fixed">
                    <Button onMouseDown={e => this.onResolve()} ghost><S>已解决</S></Button>
                </div>
            </div>}
            {this.elementUrl && <CommentListView
                ref={e => this.cv = e}
                sort={'date'}
                displayFormat={this.displayFormat}
                userid={this.userid}
                elementUrl={this.elementUrl}
                ws={this.ws}
                contentHeight={200}
            ></CommentListView>}
        </div>
    }
    cv: CommentListView;
    displayFormat?: 'comment' | 'discuss' = 'comment';
    userid: string;
    elementUrl: string;
    ws?: LinkWs;
    resolvedHtml?: string
    async open(props: {
        userid: string;
        elementUrl: string;
        displayFormat?: 'comment' | 'discuss',
        ws?: LinkWs,
        resolvedHtml?: string
    }) {
        this.userid = props.userid;
        this.elementUrl = props.elementUrl;
        this.displayFormat = props.displayFormat;
        this.ws = props.ws;
        this.resolvedHtml = props.resolvedHtml;
        this.forceUpdate(() => {
            this.emit('update')
            if (this.cv) {
                this.cv.onFocusInput();
            }
        });
    }
    getCount() {
        if (this.cv) return this.cv.total;
    }
    async onResolve() {
        await channel.del('/ws/comment/del', { elementUrl: this.elementUrl })
        this.emit('resolve')
    }
}

export async function useCommentListView(pos: PopoverPosition, props: {
    userid: string;
    elementUrl: string;
    displayFormat?: 'comment' | 'discuss',
    ws?: LinkWs,
    resolvedHtml?: string
}) {
    if (!pos) pos = { center: true }
    let popover = await PopoverSingleton(CommentDialoug, { mask: true });
    let fv = await popover.open(pos);
    await fv.open(props);
    return new Promise((resolve: (count: number) => void, reject) => {
        popover.only('willClose', () => {
            resolve(fv.getCount())
        });
        fv.only('update', () => {
            popover.updateLayout();
        })
        fv.only('resolve', () => {
            resolve(-1);
        })
    })
}