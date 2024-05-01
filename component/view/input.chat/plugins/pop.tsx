import React, { CSSProperties } from "react";
import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { UserBasic } from "../../../../types/user";
import { Point, Rect } from "../../../../src/common/vector/point";
import { SpinBox } from "../../spin";
import lodash from "lodash";
import { util } from "../../../../util/util";
import { Divider } from "../../grid";
import { ChatInput } from "../chat";
import { Avatar } from "../../avator/face";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";


/**
 * 
 * https://www.zhangxinxu.com/wordpress/2022/08/gitee-feishu-okr-at-mention/
 * 
 * 
 */
export class ChatInputPop extends React.Component<{
    search: (word?: string) => Promise<UserBasic[]>,
    select: (user: UserBasic) => void,
    cp: ChatInput
}> {
    visible: boolean = false;
    node: HTMLElement;
    nodeText: string;
    nodeOffset: number;
    async open() {
        try {
            this.isContinueEmpty = false;
            var sel = window.getSelection();
            this.node = sel.focusNode as any;
            /**
             * current text "sssss @" 基中“@”还没有输入
             */
            this.nodeText = this.node === this.props.cp.richEl ? this.props.cp.richEl.innerHTML : this.node.textContent;
            this.nodeOffset = sel.focusOffset;
            this.visible = true;
            var rect = Rect.fromEle(sel.getRangeAt(0));
            if (this.node === this.props.cp.richEl) {
                rect = Rect.fromEle(this.props.cp.richEl)
            }
            this.point = rect.clone().leftBottom.move(0, 10)
            if (typeof this.props.search == 'function') {
                this.users = await this.props.search();
            }
        }
        catch (ex) {
            console.error(ex)
        }
        finally {
            this.forceUpdate()
        }
    }
    keydown(key: string) {
        if (key == 'enter') {
            if (this.selectIndex == 0 && lst('所有人').startsWith(this.word)) this.select({ name: lst('所有人'), id: 'all' } as any)
            else {
                var g = this.users[lst('所有人').startsWith(this.word) ? this.selectIndex - 1 : this.selectIndex];
                this.select(g);
            }
        }
        else if (key == 'arrowdown') {
            if (this.selectIndex + 1 == (this.users.length + (lst('所有人').startsWith(this.word) ? 1 : 0))) { this.selectIndex = 0 }
            else this.selectIndex++;
            this.forceUpdate(() => {
                var eg = this.el.querySelector('.item-hover-focus');
                if (eg) {
                    (eg as HTMLElement).scrollIntoView();
                }
            })
        }
        else if (key == 'arrowup') {
            if (this.selectIndex - 1 == (lst('所有人').startsWith(this.word) ? -1 : 0)) { this.selectIndex = this.users.length }
            else this.selectIndex--;
            this.forceUpdate(() => {
                var eg = this.el.querySelector('.item-hover-focus');
                if (eg) {
                    (eg as HTMLElement).scrollIntoView();
                }
            })
        }
    }
    select(user: UserBasic) {
        if (user)
            this.props.select(user);
        this.hide()
    }
    back() {
        // var sel = window.getSelection();
        // if (sel.focusOffset < this.nodeOffset) {
        //     this.hide()
        // }
    }
    keyup() {
        console.log('keyup...')
        var content = this.node == this.props.cp.richEl ? this.props.cp.richEl.innerHTML : this.node.textContent;
        var word = content.slice(this.nodeOffset);
        if (word && word.startsWith('@')) {
            this.search(word.slice(1))
        }
        else this.hide()
    }
    hide() {
        this.visible = false;
        this.isContinueEmpty = false;
        this.forceUpdate()
    }
    isContinueEmpty: boolean = false;
    word: string = ''
    search = lodash.debounce(async (word: string) => {
        if (this.word == word) return;
        this.loading = true;
        this.forceUpdate()
        try {
            this.word = word;
            if (typeof this.props.search == 'function') {
                this.users = await this.props.search(word);
                this.selectIndex = 0;
                if (this.users.length == 0) {
                    if (this.isContinueEmpty == true) {
                        this.hide();
                        return;
                    }
                    this.isContinueEmpty = true;
                }
                else this.isContinueEmpty = false;
            }
            else this.users = [
                { id: 'kan', name: 'ggg' },
                { id: 'kanaa', name: 'kanhai' },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
                { id: util.guid(), name: util.guid() },
            ] as any;
        }
        catch (ex) {

        }
        finally {
            this.loading = false;
            this.forceUpdate()
        }
    }, 300)
    users: UserBasic[] = [];
    el: HTMLElement;
    point: Point = new Point();
    loading: boolean = false;
    render(): ReactNode {
        var style: CSSProperties = {
            top: this.point.y - 30,
            left: this.point.x,
            userSelect: 'none',
            transform: 'translate(0px, -100%)',
            zIndex: '10000'
        };
        if (this.visible) style.display = 'block';
        else style.display = 'none';
        return createPortal(<div
            ref={e => this.el = e}
            className="bg-white pos border shadow w-220   round  max-h-250 overflow-y" style={style}>
            {!this.loading && <div>
                {(!this.word || this.word && lst('所有人').startsWith(this.word)) && <>
                    <div onClick={e => this.select({ name: lst('所有人'), id: 'all' } as any)} className={"h-30 gap-t-5 item-hover round  gap-w-5 padding-w-5 cursor flex" + (this.selectIndex == 0 ? " item-hover-focus" : "")}><S>@所有人</S></div>
                    <Divider></Divider>
                </>}
                {this.users.map((u, index) => {
                    return <div
                        onClick={e => this.select(u)}
                        key={u.id}
                        className={'h-30 gap-h-5 item-hover round gap-w-5 padding-w-5 cursor flex' + (this.selectIndex == (index + (lst('所有人').startsWith(this.word) ? 1 : 0)) ? " item-hover-focus" : "")}>
                        <Avatar middle size={24} userid={u.id} showName></Avatar>
                    </div>
                })}
            </div>}
            {this.loading && <div className="gap-h-5">
                <SpinBox spin={this.loading}></SpinBox>
            </div>}
            {this.users.length == 0 && this.loading == false && <div className="remark f-12 gap-10"><S>没有搜到用户</S></div>}
        </div>, this.panel)
    }
    private _panel: HTMLElement;
    get panel() {
        if (!this._panel) {
            this._panel = document.createElement('div');
            document.body.appendChild(this._panel)
        }
        return this._panel;
    }
    componentWillUnmount(): void {
        if (this.panel) this.panel.remove()
    }
    selectIndex = 0;
}