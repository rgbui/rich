import React from "react";
import { Tip } from "../../component/tip";
import { dom } from "../../src/common/dom";

import { emojiStore, EmojiType } from "./store";

export class EmojiView extends React.Component<{ loaded?: () => void, onChange: (emoji: EmojiType) => void }>{
    loading: boolean = true;
    private scrollIndex = 0;
    private scrollOver: boolean = false;
    shouldComponentUpdate(nextProps, nextStates) {
        return false;
    }
    componentDidMount() {
        this.loading = true;
        emojiStore.get().then(r => {
            this.emojis = r;
            this.loading = false;
            this.forceUpdate(() => {
                if (typeof this.props.loaded == 'function') this.props.loaded()
            });
        })
    }
    emojis: EmojiType[] = [];
    renderEmoji() {
        if (this.loading == true) return <div className='shy-emoji-view-loading'></div>
        var cs = this.emojis.lookup(x => x.category);
        var els: JSX.Element[] = [];
        var i = 0;
        cs.forEach((value, category) => {
            if (i > this.scrollIndex) return <div key={category}></div>;
            i += 1;
            els.push(<div className='shy-emoji-view-category' key={category}>
                <div className='shy-emoji-view-category-head'><span>{category}</span></div>
                <div className='shy-emoji-view-category-emojis'>{value.map(emoji => {
                    return <Tip overlay={<>{emoji.name}</>} key={emoji.char}><span onMouseDown={e => this.props.onChange(emoji)} >{emoji.char}</span></Tip>
                })}</div>
            </div>)
        });
        if (this.scrollIndex > i) this.scrollOver = true;
        return els;
    }
    render() {
        return <div className='shy-emoji-view' onScroll={e => this.onScroll(e)}>{this.renderEmoji()}</div>
    }
    private isScrollRendering: boolean = false;
    onScroll(event: React.UIEvent) {
        if (this.scrollOver == true) return;
        var dm = dom(event.target as HTMLElement);
        if (dm.isScrollBottom(100)) {
            if (this.isScrollRendering == true) return;
            this.scrollIndex += 1;
            this.isScrollRendering = true;
            this.forceUpdate(() => {
                this.isScrollRendering = false;
            })
        }
    }
}