import React from "react";
import lodash from "lodash";
import { EventsComponent } from "../../component/lib/events.component";
import { channel } from "../../net/channel";
import { UserBasic } from "../../types/user";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { Avatar } from "../../component/view/avator/face";
import { KeyboardCode } from "../../src/common/keys";
import { Divider } from "../../component/view/grid";
import { Input } from "../../component/view/input";
import { Spin } from "../../component/view/spin";
import { LinkWs } from "../../src/page/declare";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";

export class UserPicker extends EventsComponent {
    render() {
        return <div className="padding-h-10 min-w-300" ref={e => this.el = e}>
            <div className="gap-w-14">
                <Input value={this.text} placeholder={lst('搜索用户')}
                    onEnter={e => this.onEnter()}
                    onKeydown={e => this.onKeydown(e)}
                    onChange={e => { this.text = e; this.syncSearch() }}
                ></Input>
            </div>
            <Divider></Divider>
            <div className="max-h-300 overflow-y">
                {this.loading && <Spin></Spin>}
                {!this.loading && this.links.map((link,i)=>{
                    return <div onMouseDown={e => this.onSelect(link)} className={"h-30 gap-h-5 padding-w-14 flex item-hover round cursor" + ((i) == this.selectIndex ? " item-hover-light-focus" : "")} key={link.id}>
                        <Avatar size={24} showName userid={(link as any).id}></Avatar>
                        <span className="gap-l-10">{link.name}</span>
                    </div>
                })}
                {this.links.length == 0 && <a className="remark f-12 padding-w-14 h-30 flex"><S>没有搜索到</S></a>}
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
            var r = await channel.get('/ws/member/word/query', { word: this.text, ws: this.ws });
            if (r.ok) {
                this.links = r.data.list.map(c => {
                    return {
                        id: c.userid
                    }
                }) as any
                if (!(this.options?.ignoreUserAll === true) && lst('所有人').startsWith(this.text)) {
                    this.links.splice(0, 0, { id: 'all' } as any)
                }
            }
            else this.links = [];
        }
        else this.links = lodash.cloneDeep(this.defaultList);
        this.loading = false;
        this.forceUpdate();
    }, 1000)
    defaultList: UserBasic[] = [];
    ws: LinkWs;
    options?: { ignoreUserAll?: boolean }
    open(ws: LinkWs, options?: { ignoreUserAll?: boolean }) {
        this.ws = ws;
        this.options = options;
        this.loading = true;
        this.text = '';
        if (this.inputEl) this.inputEl.updateValue('');
        this.links = [];
        this.forceUpdate();
        this.load().then(g => {
            this.loading = false;
            this.selectIndex = 0;
            this.forceUpdate();
        })
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
    async load() {
        var r = await channel.get('/ws/members', {
            page: 1,
            size: 200,
            ws: this.ws
        });
        if (r.ok) {
            this.links = r.data.list.map(g => {
                return {
                    id: g.userid
                }
            }) as any;
            if (!(this.options?.ignoreUserAll === true))
                this.links.splice(0, 0, { id: 'all' } as any)
            this.defaultList = lodash.cloneDeep(this.links)
        }
    }
}

export async function useUserPicker(pos: PopoverPosition, ws: LinkWs, options?: { ignoreUserAll?: boolean }) {
    let popover = await PopoverSingleton(UserPicker, { mask: true });
    let fv = await popover.open(pos);
    fv.open(ws, options);
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