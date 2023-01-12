import React from "react";
import lodash from "lodash";
import { EventsComponent } from "../../component/lib/events.component";

import { channel } from "../../net/channel";
import { UserBasic } from "../../types/user";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { Loading } from "../../component/view/loading";
import { Avatar } from "../../component/view/avator/face";
import { KeyboardCode } from "../../src/common/keys";
import { Divider } from "../../component/view/grid";
import { Input } from "../../component/view/input";


export class UserPicker extends EventsComponent {
    render() {
        return <div className="padding-h-10 min-w-300" ref={e => this.el = e}>
            <div className="gap-w-14">
                <Input value={this.text} placeholder={'搜索用户'}
                    onEnter={e => this.onEnter()}
                    onKeydown={e => this.onKeydown(e)}
                    onChange={e => { this.text = e; this.syncSearch() }}
                ></Input>
            </div>
            <Divider></Divider>
            <div className="max-h-300 padding-b-10 overflow-y">
                {this.loading && <Loading></Loading>}
                {!this.loading && this.links.map((link, i) => {
                    return <div onMouseDown={e => this.onSelect(link)} className={"h-40 padding-w-14 flex item-hover round cursor" + ((i) == this.selectIndex ? " item-hover-focus" : "")} key={link.id}>
                        <Avatar size={30} userid={(link as any).id}></Avatar>
                        <span className="gap-l-10">{link.name}</span>
                    </div>
                })}
                {this.links.length == 0 && <a className="remark f-12 padding-w-14 h-30 flex">没有搜索到</a>}
            </div>
        </div>
    }
    private el: HTMLElement;
    private inputEl: Input;
    private selectIndex: number = 0;
    text: string = '';
    links: UserBasic[] = [];
    loading = false;

    onKeydown(event: React.KeyboardEvent) {
        if (event.code == KeyboardCode.ArrowDown) {
            event.stopPropagation();
            event.preventDefault();
            this.selectIndex += 1;
            if (this.selectIndex >= this.links.length) {
                this.selectIndex = 0;
            }
            this.forceUpdate();
        }
        else if (event.code == KeyboardCode.ArrowUp) {
            event.stopPropagation();
            event.preventDefault();
            this.selectIndex -= 1;
            if (this.selectIndex == -1) {
                this.selectIndex = this.links.length - 1;
            }
            this.forceUpdate();
        }
        else if (event.code == KeyboardCode.Enter) {
            event.stopPropagation();
            event.preventDefault();
            var link = this.links[this.selectIndex];
            if (link) this.onSelect(link);
        }
    }
    onEnter() {
        var u = this.links[this.selectIndex];
        if (u) {
            this.emit('change', u);
        }
    }
    syncSearch = lodash.debounce(async () => {
        this.loading = true;
        this.forceUpdate();
        if (this.text) {
            var r = await channel.get('/ws/member/word/query', { word: this.text });
            if (r.ok) {
                this.links = r.data.list.map(c => {
                    return {
                        id: c.userid
                    }
                }) as any
            }
            else this.links = [];
        }
        else this.links = [];
        this.loading = false;
        this.forceUpdate();
    }, 1000)
    open() {
        this.loading = false;
        this.text = '';
        if (this.inputEl) this.inputEl.updateValue('');
        this.links = [];
        this.selectIndex = 0;
        this.forceUpdate();
    }
    onSelect(link: UserBasic) {
        this.emit('change', link);
    }
    componentDidUpdate() {
        var el = this.el.querySelector('.selected') as HTMLElement;
        if (el) {
            el.scrollIntoView({
                block: "nearest",
                inline: "nearest"
            });
        }
    }
}

export async function useUserPicker(pos: PopoverPosition, options?: {}) {
    let popover = await PopoverSingleton(UserPicker, { mask: true });
    let fv = await popover.open(pos);
    fv.open();
    return new Promise((resolve: (data: UserBasic) => void, reject) => {
        fv.only('change', (value) => {
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