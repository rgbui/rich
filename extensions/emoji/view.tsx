import React from "react";
import { Tip } from "../../component/view/tip";
import { dom } from "../../src/common/dom";
import { EmojiCode, emojiStore, EmojiType } from "./store";
export class EmojiView extends React.Component<{ loaded?: () => void, onChange: (emoji: EmojiCode) => void }>{
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
    onChange(code: EmojiCode) {
       this.props.onChange(code); 
    }
    emojis: EmojiType[] = [];
    renderEmoji() {
        if (this.loading == true) return <div className='shy-emoji-view-loading'></div>
        // var cs = this.emojis.lookup(x => x.category);
        var els: JSX.Element[] = [];
        var i = 0;
        this.emojis.forEach(category => {
            if (i > this.scrollIndex) return <div key={category.id}></div>;
            i += 1;
            els.push(<div className='shy-emoji-view-category' key={category.id}>
                <div className='shy-emoji-view-category-head'><span>{category.name}</span></div>
                <div className='shy-emoji-view-category-emojis'>{category.childs.map(emoji => {
                    return <Tip overlay={<>{emoji.name}</>} key={emoji.code}><span onMouseDown={e => this.onChange(emoji)} >{emoji.code}</span></Tip>
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