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


export class UserPicker extends EventsComponent {
    render() {
        return <div className="gap-h-10 " ref={e => this.el = e}>
            <div className="gap-w-10">
                <input className="shy-input" ref={e => this.inputEl = e} value={this.text} onKeyDown={e => this.onKeydown(e)} onChange={e => this.onInput(e)} type='text' />
            </div>
            <Divider></Divider>
            <div className="max-h-300 overflow-y">
                {this.loading && <Loading></Loading>}
                {!this.loading && this.links.map((link, i) => {
                    return <div onMouseDown={e => this.onSelect(link)} className={"h-40 padding-w-10 flex item-hover round cursor" + ((i) == this.selectIndex ? " item-hover-focus" : "")} key={link.id}>
                        <Avatar size={30} user={link} userid={(link as any).id}></Avatar>
                        <span className="gap-l-10">{link.name}</span>
                    </div>
                })}
                {!this.loading && this.links.length == 0 && this.isSearch && <a className="remark">没有搜索到</a>}
            </div>

        </div>
    }
    private el: HTMLElement;
    private inputEl: HTMLInputElement;
    private selectIndex: number = 0;
    text: string = '';
    links: UserBasic[] = [];
    loading = false;
    isSearch = false;
    onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.text = (e.target as HTMLInputElement).value;
        this.text = this.text.trim();
        this.syncSearch();
    }
    onKeydown(event: React.KeyboardEvent<HTMLInputElement>) {
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
    syncSearch = lodash.debounce(async () => {
        this.loading = true;
        this.forceUpdate();
        if (this.text) {
            var r = await channel.get('/ws/member/word/query', { word: this.text });
            this.isSearch = true;
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
        if (this.inputEl) this.inputEl.value = '';
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