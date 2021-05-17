import React from "react";
import { createPortal } from "react-dom";
import { Dragger } from "../../common/dragger";
import { Point } from "../../common/point";
import Axios from "axios";
import { SyPlugComponent } from "../sy.plug.component";

export type EmojiType = {
    char: string,
    name: string,
    category: string,
    keywords: string[]
}


export class EmojiPicker extends SyPlugComponent {
    constructor(props) {
        super(props);
        this.node = document.createElement('div');
        document.body.appendChild(this.node);
    }
    private node: HTMLElement;
    get isVisible() {
        return this.visible;
    }
    open(event: MouseEvent) {
        this.point = Point.from(event);
        this.visible = true;
        this.forceUpdate();
        if (this.isLoaded == false) {
            this.load()
        }
    }
    close() {
        this.visible = false;
        this.forceUpdate();
    }
    private visible: boolean = false;
    private point: Point = new Point(0, 0);
    private emojis: EmojiType[] = [];
    render() {
        var style: Record<string, any> = {};
        style.top = this.point.y;
        style.left = this.point.x;
        return createPortal(
            <div>
                {this.visible && <div className='sy-emoji-picker' style={style}>{this.renderEmoji()}</div>}
            </div>,
            this.node);
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
        this.dragger = new Dragger(this.node);
        this.dragger.bind();
    }
    componentWillUnmount() {
        if (this.dragger) this.dragger.off()
        this.node.remove();
    }
    private isLoaded: boolean = false;
    private loading: boolean = false;
    async load() {
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
    on(name: 'pick', fn: (data: EmojiType) => void);
    emit(name: 'pick', data: EmojiType);
}