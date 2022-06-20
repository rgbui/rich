import React from "react";
import lodash from "lodash";
import { EventsComponent } from "../../component/lib/events.component";
import { Remark } from "../../component/view/text";
import { channel } from "../../net/channel";
import { UserBasic } from "../../types/user";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { Loading } from "../../component/view/loading";
import { Avatar } from "../../component/view/avator/face";
import { KeyboardCode } from "../../src/common/keys";

export class UserPicker extends EventsComponent {
    render() {
        return <div className="shy-user-picker" ref={e => this.el = e}>
            <div className="shy-user-picker-input">
                <input ref={e => this.inputEl = e} value={this.text} onKeyDown={e => this.onKeydown(e)} onChange={e => this.onInput(e)} type='text' />
            </div>
            <Remark>选择用户</Remark>
            <div className="shy-user-picker-users">
                {this.loading && <Loading></Loading>}
                {!this.loading && this.links.map((link, i) => {
                    return <a onMouseDown={e => this.onSelect(link)} className={"shy-memeber" + ((i) == this.selectIndex ? " selected" : "")} key={link.id}>
                        <Avatar size={30} user={link} userid={(link as any).userid}></Avatar>
                        <span>{link.name}</span>
                    </a>
                })}
                {!this.loading && this.links.length == 0 && this.isSearch && <a><Remark>没有搜索到</Remark></a>}
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
                this.links = r.data.list;
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
        this.links = [];
        this.selectIndex = 0;
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
    return new Promise((resolve: (data: {
        text: string,
        url: string
    }) => void, reject) => {
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