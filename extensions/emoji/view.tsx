import lodash from "lodash";
import React from "react";
import { RandomSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { Input } from "../../component/view/input";
import { SpinBox } from "../../component/view/spin";
import { Tip } from "../../component/view/tooltip/tip";
import { channel } from "../../net/channel";
import { getEmoji } from "../../net/element.type";
import { dom } from "../../src/common/dom";
import { EmojiCode, emojiStore, EmojiType } from "./store";
import "./style.less";
const EMOJI_HISTORYS = '_emoji_historys';
export class EmojiView extends React.Component<{ loaded?: () => void, onChange: (emoji: EmojiCode) => void }>{
    loading: boolean = true;
    private scrollIndex = 0;
    private scrollOver: boolean = false;
    historyEmojis: EmojiCode[] = [];
    shouldComponentUpdate(nextProps, nextStates) {
        return false;
    }
    async onRandomIcon() {
        var e = await emojiStore.getRandom()
        this.props.onChange(e);
    }
    componentDidMount() {
        this.load();
    }
    async load() {
        this.loading = true;
        this.forceUpdate();
        var r = await emojiStore.get();
        this.emojis = r;
        this.loading = false;
        var rs = await channel.query('/cache/get', { key: EMOJI_HISTORYS });
        if (Array.isArray(rs) && rs.length > 0) this.historyEmojis = rs;
        else this.historyEmojis = [];
        this.forceUpdate();
    }
    async onChange(code: EmojiCode) {
        if (!this.historyEmojis.some(s => s.code == code.code)) {
            this.historyEmojis.push(code);
            await channel.act('/cache/set', { key: EMOJI_HISTORYS, value: this.historyEmojis })
        }
        this.props.onChange(code);
    }
    emojis: EmojiType[] = [];
    renderEmoji() {
        if (this.loading == true) return <SpinBox></SpinBox>
        // var cs = this.emojis.lookup(x => x.category);
        var els: JSX.Element[] = [];
        if (this.historyEmojis.length > 0) {
            els.push(<div className='shy-emoji-view-category' key={'history'}>
                <div className='shy-emoji-view-category-head'><span>{'category.name'}</span></div>
                <div className='shy-emoji-view-category-emojis'>{this.historyEmojis.map(emoji => {
                    return <Tip overlay={<>{emoji.name}</>} key={emoji.code}><span className="ef" onMouseDown={e => this.onChange(emoji)} dangerouslySetInnerHTML={{ __html: getEmoji(emoji.code) }}></span></Tip>
                })}</div>
            </div>)
        }
        var i = 0;
        this.emojis.forEach(category => {
            if (i > this.scrollIndex) return <div key={category.id}></div>;
            i += 1;
            els.push(<div className='shy-emoji-view-category' key={category.id}>
                <div className='shy-emoji-view-category-head'><span>{category.name}</span></div>
                <div className='shy-emoji-view-category-emojis'>{category.childs.map(emoji => {
                    return <Tip overlay={<>{emoji.name}</>} key={emoji.code}><span className="ef" onMouseDown={e => this.onChange(emoji)} dangerouslySetInnerHTML={{ __html: getEmoji(emoji.code) }}></span></Tip>
                })}</div>
            </div>)
        });
        if (this.scrollIndex > i) this.scrollOver = true;
        return els;
    }
    renderSearch() {
        if (this.searchEmojis.length == 0) return <div className="flex-center remark padding-14 f-12 ">没有搜索表情</div>
        return <div className='shy-emoji-view-category'>
            <div className="shy-emoji-view-category-emojis">
                {this.searchEmojis.map(emoji => {
                    return <Tip overlay={<>{emoji.name}</>} key={emoji.code}><span className="ef" onMouseDown={e => this.onChange(emoji)} dangerouslySetInnerHTML={{ __html: getEmoji(emoji.code) }}></span></Tip>
                })}
            </div></div>
    }
    render() {
        return <div>
            <div className="flex padding-t-14 padding-w-14">
                <div className="flex-auto"><Input clear placeholder="搜索..." value={this.word} onClear={() => this.loadSearch('')} onEnter={e => { this.word = e; this.loadSearch.flush() }} onChange={e => this.loadSearch(e)} ></Input></div>
                <div className="flex-fixed gap-l-20 gap-r-10 text-1">
                    <Tip overlay={<>随机</>}><span onMouseDown={e => this.onRandomIcon()} className=" flex-center size-30 round item-hover cursor">
                        <Icon size={18} icon={RandomSvg}></Icon>
                    </span></Tip>
                </div>
            </div>
            {this.word && <div className='shy-emoji-view'>
                {this.searching && <SpinBox></SpinBox>}
                {this.renderSearch()}
            </div>}
            {!this.word && <div className='shy-emoji-view' onScroll={e => this.onScroll(e)}>{this.renderEmoji()}</div>}
        </div>
    }
    private isScrollRendering: boolean = false;
    private word: string = '';
    private searching: boolean = false;
    private searchEmojis: EmojiCode[] = [];
    loadSearch = lodash.debounce((w) => {
        if (typeof w == 'string') this.word = w;
        this.searchEmojis = [];
        this.searching = true;
        this.forceUpdate()
        if (this.word) {
            this.emojis.forEach(ej => {
                ej.childs.forEach(c => {
                    if (c.name.indexOf(this.word) > -1 || Array.isArray(c.keywords) && c.keywords.some(s => s.indexOf(this.word) > -1)) {
                        this.searchEmojis.push(c)
                    }
                })
            })
            this.searching = false;
            this.forceUpdate()
        }
    }, 800)
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