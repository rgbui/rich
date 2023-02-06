
import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { EmojiSvg } from "../../component/svgs";
import { Avatar } from "../../component/view/avator/face";
import { Button } from "../../component/view/button";
import { Divider } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { Rect } from "../../src/common/vector/point";
import { useOpenEmoji } from "../emoji";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";

class UserComments extends EventsComponent {
    open(options: UserComments['options']) {
        this.options = options;
        this.forceUpdate(() => {
            if (this.textarea) this.textarea.value = '';
        })
    }
    textarea: HTMLTextAreaElement;
    options: { userid: string, placeholder?: string };
    async onOpenEmjoji(event: React.MouseEvent) {
        var s = this.textarea.selectionStart;
        var e = this.textarea.selectionEnd;
        if (s > e) [s, e] = [e, s];
        var r = await useOpenEmoji({ roundArea: Rect.fromEvent(event) });
        if (r?.code) {
            var val = this.textarea.value;
            var nv = val.slice(0, s) + r.code + val.slice(e);
            this.textarea.value = nv;
            var pos = s + r.code.length
            setTimeout(() => {
                this.textarea.focus();
                this.textarea.setSelectionRange(pos, pos);
            }, 100);
        }
    }
    async addComment(event: React.MouseEvent) {
        event.preventDefault();
        var value = this.textarea.value;
        if (value) {
            this.emit('save', value);
        }
    }
    render() {
        return <div className="padding-14 round min-w-350">
            {this.options && <div className="flex-top">
                <Avatar className="flex-fixed" size={32} userid={this.options.userid}></Avatar>
                <div
                    className="flex-auto gap-l-10 border round padding-10"
                    style={{ height: 92 }}
                >
                    <textarea
                        className="ef"
                        style={{
                            width: '100%',
                            lineHeight: "24px",
                            border: 'none',
                            padding: 0,
                            height: 50
                        }}
                        placeholder={this.options.placeholder || "评论千万条，友善第一条"}
                        ref={e => this.textarea = e}></textarea>
                    <><Divider></Divider>
                        <div className="flex">
                            <div className="flex-auto">
                                <span onMouseDown={e => this.onOpenEmjoji(e)} className="size-24 flex-center round item-hover"><Icon size={18} icon={EmojiSvg}></Icon></span>
                            </div>
                            <span className="flex-fixed flex">
                                <Button size="small" onMouseDown={e => this.addComment(e)}>发布</Button>
                            </span>
                        </div></>
                </div>
            </div>}
        </div>
    }
}

export async function useUserComments(options: UserComments['options']) {
    var pos: PopoverPosition = { center: true };
    let popover = await PopoverSingleton(UserComments, { mask: true, });
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (id: string) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        popover.only('close', () => {
            resolve(null)
        });
    })
}
