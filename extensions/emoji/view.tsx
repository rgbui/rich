import React from "react";
import { Tip } from "../../component/tip";
import { emojiStore, EmojiType } from "./store";

export class EmojiView extends React.Component<{ loaded?: () => void, change: (emoji: EmojiType) => void }>{
    loading: boolean = false;
    componentDidMount() {
        emojiStore.get().then(r => {
            this.emojis = r;
            this.loading = true;
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
        cs.forEach((value, category) => {
            els.push(<div className='shy-emoji-view-category' key={category}>
                <div className='shy-emoji-view-category-head'><span>{category}</span></div>
                <div className='shy-emoji-view-category-emojis'>{value.map(emoji => {
                    return <Tip overlay={<>{emoji.name}</>} key={emoji.char}><span onMouseDown={e => this.props.change(emoji)} >{emoji.char}</span></Tip>
                })}</div>
            </div>)
        })
        return els;
    }
    render() {

        return <div className='shy-emoji-view'>{this.renderEmoji()}</div>
    }
}