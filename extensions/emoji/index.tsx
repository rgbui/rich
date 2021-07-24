import React from "react";
import { Dragger } from "../../src/common/dragger";
import { Point, Rect, RectUtility } from "../../src/common/point";
import Axios from "axios";
import { SyExtensionsComponent } from "../sy.component";
import { Singleton } from "../Singleton";
export type EmojiType = {
    char: string,
    name: string,
    category: string,
    keywords: string[]
}
export class EmojiPicker extends SyExtensionsComponent {
    constructor(props) {
        super(props);
    }
    get isVisible() {
        return this.visible;
    }
    async open(point: Point) {
        this.point = point;
        this.visible = true;
        let adjustPostion = () => {
            var el = this.el.querySelector(".sy-emoji-picker");
            if (el) {
                var bound = el.getBoundingClientRect();
                var newPoint = RectUtility.getChildRectPositionInRect(this.point, Rect.from(bound))
                if (!this.point.equal(newPoint)) {
                    this.point = newPoint;
                    this.forceUpdate()
                }
            }
        }
        if (this.isLoaded == false) {
            this.forceUpdate();
            await this.import();
            this.forceUpdate(() => adjustPostion())
        }
        else this.forceUpdate(() => adjustPostion())
    }
    close() {
        this.visible = false;
        this.forceUpdate();
    }
    private visible: boolean = false;
    private point: Point = new Point(0, 0);
    private emojis: EmojiType[] = [];
    private el: HTMLElement;
    render() {
        var style: Record<string, any> = {};
        style.top = this.point.y;
        style.left = this.point.x;
        return <div ref={e => this.el = e}>
            {this.visible && <div className='sy-emoji-picker' style={style}>{this.renderEmoji()}</div>}
        </div>
    }
    renderEmoji() {
        if (this.loading == true) return <div className='sy-emoji-picker-loading'></div>
        var cs = this.emojis.lookup(x => x.category);
        var els: JSX.Element[] = [];
        for (var category in cs) {
            els.push(<div className='sy-emoji-picker-category' key={category}>
                <div className='sy-emoji-picker-category-head'></div>
                <div className='sy-emoji-picker-category-emojis'>{cs.get(category).map(emoji => {
                    return <div className='sy-emoji-picker-category-emoji' onMouseDown={e => this.onPick(emoji)} key={emoji.char}>{emoji.char}</div>
                })}</div>
            </div>)
        }
        return els;
    }
    private dragger: Dragger;
    componentDidMount() {
        this.dragger = new Dragger(this.el);
        this.dragger.bind();
    }
    componentWillUnmount() {
        if (this.dragger) this.dragger.off()
    }
    private isLoaded: boolean = false;
    private loading: boolean = false;
    async import() {
        //加载数据
        this.loading = true;
        var data = await Axios.get('/data/emoji.json');
        this.emojis = data.data.map(g => {
            return {
                char: g.char,
                name: g.name,
                category: g.group,
                keywords: g.keywords,
            }
        });
        this.loading = false;
    }
    private onPick(emoji: EmojiType) {
        this.close();
        this.emit('pick', emoji);
    }
}
export interface EmojiPicker {
    only(name: 'pick', fn: (data: EmojiType) => void);
    emit(name: 'pick', data: EmojiType);
}
export async function OpenEmoji(point: Point) {
    var emojiPicker = await Singleton<EmojiPicker>(EmojiPicker);
    return new Promise((resolve, reject) => {
        emojiPicker.only('pick', (data) => {
            resolve(data);
        })
    })
}
