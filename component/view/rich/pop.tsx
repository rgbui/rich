import lodash from "lodash";
import React, { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Point, Rect } from "../../../src/common/vector/point";
import { UserBasic } from "../../../types/user";
import { Avatar } from "../avator/face";
import { SpinBox } from "../spin";
export class RichPop extends React.Component<{
    searchUser?: (word: string) => Promise<UserBasic[]>,
    select?: (el: HTMLElement, offset: number, user: UserBasic) => void,
}>{
    render() {
        var style: CSSProperties = {
            top: this.point.y,
            left: this.point.x
        };
        if (this.visible) style.display = 'flex';
        else style.display = 'none';
        return createPortal(<div
            ref={e => this.el = e}
            className="bg-white border shadow w-120  round  max-h-250 overflow-y" style={style}>
            {this.users.map((u, index) => {
                return <div onClick={e => this.onSelect(u)} key={u.id} className={'h-30 item-hover round padding-w-10 cursor flex' + (this.selectIndex == index ? " item-hover-focus" : "")}><Avatar user={u}></Avatar></div>
            })}
            <SpinBox spin={this.loading}></SpinBox>
            {this.users.length == 0 && this.word && <div className="remark f-12">没有搜到用户</div>}
        </div>,
            document.body)
    }
    el: HTMLElement;
    startEl: HTMLElement;
    offset: number;
    point: Point;
    relativeRect: Rect;
    open(
        rect: Rect,
        el: HTMLElement,
        offset: number) {
        this.relativeRect = rect.clone()
        this.visible = true;
        this.startEl = el;
        this.offset = offset;
        this.point = this.relativeRect.leftBottom.move(0, 10)
        this.forceUpdate();
    }
    keydown(key: string) {
        if (key == 'enter') {
            this.onSelect(this.users[this.selectIndex]);
            return true;
        }
        else if (key == 'arrowdown') {
            this.selectIndex += 1;
            if (this.selectIndex >= this.users.length) this.selectIndex = 0;
            this.forceUpdate();
            return true;
        }
        else if (key == 'arrowup') {
            this.selectIndex = -1;
            if (this.selectIndex < 0) this.selectIndex = this.users.length - 1;
            this.forceUpdate();
            return true;
        }
        return false;
    }
    word: string = '';
    users: UserBasic[] = [];
    loading: boolean = false;
    search = lodash.debounce(async () => {
        if (typeof this.props.searchUser == 'function') {
            this.loading = true;
            this.forceUpdate()
            var r = this.word ? await this.props.searchUser(this.word) : [];
            this.loading = false;
            if (Array.isArray(r)) this.users = r;
            else this.users = [];
            this.adjustPos()
        }
    }, 800)
    adjustPos() {
        var newPoint: Point;
        var height = Math.min(300, this.users.length * 30);
        height = Math.max(height, 30);
        if (this.relativeRect.bottom + height > window.innerHeight) {
            newPoint = this.relativeRect.leftTop.move(0, -10);
            newPoint.move(0, 0 - height)
        }
        else {
            newPoint = this.relativeRect.leftBottom.move(0, 10)
        }
        this.point = newPoint;
        this.forceUpdate()
    }
    keyup() {
        var content = this.startEl instanceof Text ? this.startEl.textContent : this.startEl.innerText;
        var d = content.slice(this.offset);
        if (d.startsWith("@") && !d.endsWith(' ')) {
            this.word = d.slice(1);
            this.search()
        }
        else this.close()
    }
    close() {
        this.visible = false;
        this.forceUpdate()
    }
    visible: boolean = false;
    selectIndex: number = 0;
    onSelect(user: UserBasic) {
        if (user && typeof this.props.select == 'function')
            this.props.select(this.startEl, this.offset, user)
        this.close()
    }
}