import React from "react";
import { Point, Rect, RectUtility } from "../../src/common/point";
import { SyExtensionsComponent } from "../sy.component";
import { Singleton } from "../Singleton";
import './style.less';
import { EmojiType } from "./store";
import { EmojiView } from "./view";

export class EmojiPicker extends SyExtensionsComponent {
    constructor(props) {
        super(props);
    }
    get isVisible() {
        return this.visible;
    }
    async open(rect: Rect) {
        this.point = rect.leftBottom;
        this.visible = true;
        this.forceUpdate(() => { this.adjustPosition() })
    }
    adjustPosition() {
        var el = this.el.querySelector(".shy-emoji-picker");
        if (el) {
            var bound = el.getBoundingClientRect();
            var newPoint = RectUtility.getChildRectPositionInRect(this.point, Rect.from(bound))
            if (!this.point.equal(newPoint)) {
                this.point = newPoint;
                this.forceUpdate()
            }
        }
    }
    close() {
        this.visible = false;
        this.forceUpdate();
    }
    private visible: boolean = false;
    private point: Point = new Point(0, 0);
    private el: HTMLElement;
    render() {
        var style: Record<string, any> = {};
        style.top = this.point.y;
        style.left = this.point.x;
        return <div className='sy-emoji-box' ref={e => this.el = e}>
            {this.visible && <div className='sy-emoji-picker' style={style}><EmojiView loaded={() => this.adjustPosition()} change={e => this.onPick(e)}></EmojiView></div>}
        </div>
    }
    private _mousedown: (event: MouseEvent) => void;
    componentDidMount() {
        document.addEventListener('mousedown', this._mousedown = this.globalMousedown.bind(this), true);
    }
    componentWillUnmount() {
        if (this._mousedown)
            document.removeEventListener('mousedown', this._mousedown, true);
    }
    private onPick(emoji: EmojiType) {
        this.close();
        this.emit('pick', emoji);
    }
    private onClose() {
        this.close();
        this.emit('close');
    }
    private globalMousedown(event: MouseEvent) {
        var target = event.target as HTMLElement;
        if (this.el.contains(target)) return;
        if (this.visible == true) {
            this.onClose()
        }
    }
}
export interface EmojiPicker {
    only(name: 'pick', fn: (data: EmojiType) => void);
    emit(name: 'pick', data: EmojiType);
    only(name: 'close', fn: () => void);
    emit(name: 'close');
}
export async function OpenEmoji(rect: Rect) {
    var emojiPicker = await Singleton<EmojiPicker>(EmojiPicker);
    await emojiPicker.open(rect);
    return new Promise((resolve: (emoji: EmojiType) => void, reject) => {
        emojiPicker.only('pick', (data) => {
            resolve(data);
        });
        emojiPicker.only('close', () => {
            resolve(null);
        })
    })
}
