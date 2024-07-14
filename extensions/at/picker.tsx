import React from "react";
import lodash from "lodash";
import { EventsComponent } from "../../component/lib/events.component";
import { channel } from "../../net/channel";
import { UserBasic } from "../../types/user";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { Avatar } from "../../component/view/avator/face";
import { KeyboardCode } from "../../src/common/keys";
import { Input } from "../../component/view/input";
import { Spin } from "../../component/view/spin";
import { LinkWs } from "../../src/page/declare";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";
import { CloseSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";

export class UserPicker extends EventsComponent {
    onFocusInput(delay?: boolean) {
        if (this.input) {
            if (delay) {
                setTimeout(() => {
                    this.input.focus();
                }, 100);
            }
            else {
                this.input.focus();
            }
        }
    }
    input: Input;
    render() {
        return <div
            className="padding-b-10 min-w-300"
            ref={e => this.el = e}>
            <div className="padding-w-10 padding-h-5" style={{
                backgroundColor: 'rgba(242, 241, 238, 0.6)',
                boxShadow: 'rgba(55, 53, 47, 0.16) 0px -1px inset'
            }}>
                {this.isMultiple && <div className="flex flex-wrap">
                    {this.users.map((u, i) => {
                        return <span key={i} onMouseDown={e => {
                            this.users.splice(i, 1);
                            this.forceUpdate(() => {
                                this.onFocusInput(true);
                            });
                        }} className="flex-fixed flex padding-w-3 gap-r-5 round item-hover-light-focus">
                            <span className="flex-auto"><Avatar size={24} userid={u.id}></Avatar></span>
                            <span className="flex-fixed remark gap-l-3 cursor round item-hover size-20 flex-center "><Icon size={12} icon={CloseSvg}></Icon></span>
                        </span>
                    })}
                    <div className="flex-auto min-60 ">
                        <Input ref={e => this.input = e} focusSelectionAll noborder value={this.text} placeholder={lst('搜索用户')}
                            onEnter={e => this.onEnter()}
                            onKeydown={e => this.onKeydown(e)}
                            onChange={e => { this.text = e; this.syncSearch() }}
                        ></Input>
                    </div>
                </div>}
                {!this.isMultiple && <div>
                    <Input ref={e => this.input = e} focusSelectionAll noborder value={this.text} placeholder={lst('搜索用户')}
                        onEnter={e => this.onEnter()}
                        onKeydown={e => this.onKeydown(e)}
                        onChange={e => { this.text = e; this.syncSearch() }}
                    ></Input>
                </div>}
            </div>
            <div className="max-h-300 overflow-y">
                {this.loading && <Spin></Spin>}
                {!this.loading && this.links.map((link, i) => {
                    return <div onMouseDown={e => this.onSelect(link)} className={"h-30 gap-h-5 padding-w-10 flex item-hover round cursor" + ((i) == this.selectIndex ? " item-hover-light-focus" : "")} key={link.id}>
                        <Avatar size={24} showName userid={(link as any).id}></Avatar>
                        <span className="gap-l-10">{link.name}</span>
                    </div>
                })}
                {this.links.length == 0 && <a className="remark f-12 padding-w-10 h-30 flex"><S>没有搜索到</S></a>}
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
            this.onEnter();
        }
        else if (event.code == KeyboardCode.Delete || event.code == KeyboardCode.Backspace) {
            if (this.isMultiple) {
                if (!this.text && this.users.length > 0) {
                    this.users.pop();
                    this.forceUpdate();
                }
                if (!this.text && this.users.length == 0) {
                    this.emit('close');
                }
            } else {
                if (!this.text) this.emit('close');
            }
        }
        else if (event.code == KeyboardCode.Esc) {
            this.emit('close');
        }
    }
    onEnter() {
        var u = this.links[this.selectIndex];
        if (u) {
            this.onSelect(u);
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
    }, 500)
    defaultList: UserBasic[] = [];
    ws: LinkWs;
    options?: { ignoreUserAll?: boolean }
    users: UserBasic[] = [];
    isMultiple?: boolean;
    async open(ws: LinkWs, options?: {
        isMultiple?: boolean,
        users?: string[], ignoreUserAll?: boolean
    }) {
        this.ws = ws;
        this.options = options;
        this.loading = true;
        this.users = [];
        if (options.users) {
            var us = await channel.get('/users/basic', { ids: options.users });
            if (us.ok) {
                this.users = us.data.list;
            }
        }
        this.text = '';
        if (this.inputEl) this.inputEl.updateValue('');
        this.isMultiple = options.isMultiple;
        this.links = [];
        this.forceUpdate();
        this.load().then(g => {
            this.loading = false;
            this.selectIndex = 0;
            this.forceUpdate(() => {
                this.emit('update');
            });
        })
    }
    onSelect(link: UserBasic) {
        if (this.isMultiple) {
            if (!this.users.some(s => s.id == link.id)) {
                this.users.push(link);
                this.forceUpdate(() => {
                    this.onFocusInput(true);
                });
            }
        }
        else {
            this.emit('change', link);
        }
    }
    componentDidUpdate() {
        var el = this.el.querySelector('.item-hover-light-focus') as HTMLElement;
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

export async function useUserPicker(pos: PopoverPosition, ws: LinkWs, options?: {
    isMultiple?: boolean,
    users?: string[],
    ignoreUserAll?: boolean
}) {
    let popover = await PopoverSingleton(UserPicker, { mask: true });
    let fv = await popover.open(pos);
    fv.only('update', () => {
        popover.updateLayout();
    })
    await fv.open(ws, options);
    return new Promise((resolve: (data: UserBasic | UserBasic[]) => void, reject) => {
        fv.only('change', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('close', () => {
            popover.close();
            if (options.isMultiple)
                resolve(fv.users)
            else
                resolve(null);
        });
        popover.only('close', () => {
            if (options.isMultiple)
                resolve(fv.users)
            else
                resolve(null)
        });
    })
}