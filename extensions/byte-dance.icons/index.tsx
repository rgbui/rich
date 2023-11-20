import React from "react";
import { Tip } from "../../component/view/tooltip/tip";

import { dom } from "../../src/common/dom";
import { FontColorList } from "../color/data";
import { ToolTip } from "../../component/view/tooltip";
import lodash from "lodash";
import { SpinBox } from "../../component/view/spin";
import { Input } from "../../component/view/input";
import { Icon } from "../../component/view/icon";
import { CheckSvg, DiceSvg } from "../../component/svgs";
import { channel } from "../../net/channel";
import { ByteDanceType } from "./declare";
import { byteDanceStore } from "./store";
import { ls, lst } from "../../i18n/store";
import { S } from "../../i18n/view";

const BYTE_DANCE_HISTORYS = '_bytedance_historys__';
export class ByteDanceIconView extends React.Component<{ loaded?: () => void, onChange: (data: { code: string, color?: string }) => void }> {
    shouldComponentUpdate(nextProps, nextStates) {
        return false;
    }
    icons: ByteDanceType[] = [];
    color: string = '#000';
    loading: boolean = true;
    private scrollIndex = 4;
    private scrollOver: boolean = false;
    componentDidMount() {
        this.load()
    }
    historyByteDances: { e: ByteDanceType, t: number }[] = [];
    async load() {
        this.loading = true;
        var r = await byteDanceStore.get();
        this.icons = r;
        this.loading = false;
        var rs = await channel.query('/cache/get', { key: BYTE_DANCE_HISTORYS });
        if (Array.isArray(rs) && rs.length > 0) this.historyByteDances = rs;
        else this.historyByteDances = [];
        lodash.remove(this.historyByteDances, g => g.t < Date.now() - 1000 * 60 * 60 * 24 * 7 * 2);
        this.historyByteDances.sort((a, b) => b.t - a.t);
        this.forceUpdate(() => {
            if (typeof this.props.loaded == 'function') this.props.loaded()
        });
    }
    async onChange(ic: ByteDanceType) {
        if (!this.historyByteDances.some(s => s.e.name == ic.name)) {
            this.historyByteDances.push({ e: ic, t: Date.now() });
        }
        else {
            var i = this.historyByteDances.findIndex(s => s.e.name == ic.name);
            this.historyByteDances[i].t = Date.now();
        }
        this.historyByteDances.sort((a, b) => b.t - a.t);
        await channel.act('/cache/set', { key: BYTE_DANCE_HISTORYS, value: this.historyByteDances })
        if (this.props.onChange) this.props.onChange({ code: ic.name, color: this.color });
        this.forceUpdate();
    }
    renderFontAwesomes() {
        var els: JSX.Element[] = [];
        if (this.historyByteDances.length > 0)
            els.push(<div className='shy-font-awesome-category' key={'icon.name'}>
                <div className='shy-font-awesome-category-head'><span><S>最近</S></span></div>
                <div className='shy-font-awesome-category-content'>
                    {this.historyByteDances.map(ic => {
                        return <Tip overlay={ls.isCn ? ic.e.title : ic.e.name} key={ic.e.name}><a onMouseDown={e => this.onChange(ic.e)} dangerouslySetInnerHTML={{ __html: this.renderSvg(ic.e) }}>
                            {/* <i style={{ color: this.color }} className={'fa' + ' fa-' + ic.name}></i> */}
                        </a></Tip>
                    })}
                </div>
            </div>)
        if (this.scrollIndex > this.icons.length) this.scrollOver = true;
        els.push(...byteDanceStore.category.map((ic, i) => {
            if (i > this.scrollIndex) return <div key={ic.name}></div>;
            var icons = byteDanceStore.icons.filter(g => g.category == ic.name)
            return <div className='shy-font-awesome-category' key={ic.name}>
                <div className='shy-font-awesome-category-head'><span>{ls.isCn ? ic.text : ic.name}</span></div>
                <div className='shy-font-awesome-category-content'>
                    {icons.map(icon => {
                        return <Tip overlay={ls.isCn ? icon.title : icon.name} key={icon.name}><a onMouseDown={e => this.onChange(icon)} dangerouslySetInnerHTML={{ __html: this.renderSvg(icon) }}>
                            {/* <i style={{ color: this.color }} className={'fa' + ' fa-' + ic.name}></i> */}
                        </a></Tip>
                    })}
                </div>
            </div>
        }))
        return els;
    }
    onSetFont(c) {
        this.color = c.color;
        this.forceUpdate()
    }
    open(c) {
        this.color = c.color;
        this.forceUpdate()
    }
    renderFontColors() {
        return <div className='shy-font-awesome-colors'>
            {FontColorList().map((c, i) => {
                return <ToolTip overlay={c.text} key={i} ><a className={'flex-center text-white ' + (lodash.isEqual(this.color, c.color) ? "hover" : "")} onMouseDown={e => this.onSetFont(c)} style={{
                    backgroundColor: c.color == 'inherit' ? "var(--text-color)" : (typeof c.color == 'string' ? c.color : undefined),
                    backgroundImage: typeof c.color == 'string' ? undefined : c.color.grad,
                }}>{lodash.isEqual(this.color, c.color) && <Icon size={16} icon={CheckSvg}></Icon>}</a></ToolTip>
            })}
        </div>
    }
    renderSvg(icon: ByteDanceType) {
        return byteDanceStore.renderSvg(icon.name, this.color == 'inherit' ? "var(--text-color)" : this.color);
    }
    renderSearch() {
        if (this.searchEmojis.length == 0) return <div className="flex-center remark f-12"><S>没有搜索图标</S></div>
        return <div className='shy-font-awesome-category'><div className="shy-font-awesome-category-content">
            {this.searchEmojis.map(ic => {
                return <Tip overlay={ls.isCn ? ic.title : ic.name} key={ic.name}><a onMouseDown={e => this.onChange(ic)} dangerouslySetInnerHTML={{ __html: this.renderSvg(ic) }}>
                    {/* <i style={{ color: this.color }} className={'fa' + ' fa-' + ic.name}></i> */}
                </a></Tip>
            })}
        </div></div>
    }
    async onRandomIcon() {
        var e = await byteDanceStore.getRandom()
        this.onChange(e);
    }
    render() {
        return <div>
            <div className="flex padding-t-14 padding-w-10">
                <div className="flex-auto"><Input clear placeholder={lst("搜索...")} value={this.word} onClear={() => this.loadSearch('')} onEnter={e => { this.word = e; this.loadSearch.flush() }} onChange={e => this.loadSearch(e)} ></Input></div>
                <div className="flex-fixed gap-l-20  text-1">
                    <Tip overlay={<S>随机</S>}><span onMouseDown={e => this.onRandomIcon()} className=" flex-center size-30 round item-hover cursor">
                        <Icon size={24} icon={DiceSvg}></Icon>
                    </span></Tip>
                </div>
            </div>
            {this.word && <div>
                {this.searching && <SpinBox></SpinBox>}
                {this.renderSearch()}
            </div>}
            {!this.word && <div className='shy-font-awesome' onScroll={e => this.onScroll(e)}>
                {this.renderFontColors()}
                {this.loading && <div className='shy-font-awesome-loading'></div>}
                {this.loading != true && <div style={{ color: this.color == 'inherit' ? "var(--text-color)" : this.color }} className='shy-font-awesome-content'>{this.renderFontAwesomes()}</div>}
            </div>}
        </div>
    }
    private isScrollRendering: boolean = false;
    onScroll(event: React.UIEvent) {
        if (this.scrollOver == true) return;
        var dm = dom(event.target as HTMLElement);
        if (dm.isScrollBottom(100)) {
            if (this.isScrollRendering == true) return;
            this.scrollIndex += 2;
            this.isScrollRendering = true;
            this.forceUpdate(() => {
                this.isScrollRendering = false;
            })
        }
    }
    private word: string = '';
    private searching: boolean = false;
    private searchEmojis: ByteDanceType[] = [];
    loadSearch = lodash.debounce((w) => {
        if (typeof w == 'string') this.word = w;
        this.searchEmojis = [];
        this.searching = true;
        this.forceUpdate()
        if (this.word) {
            this.icons.forEach(c => {
                if (c.name.indexOf(this.word) > -1 || Array.isArray(c.tag) && c.tag.some(s => s.indexOf(this.word) > -1)) {
                    this.searchEmojis.push(c)
                }
            })
            this.searching = false;
            this.forceUpdate()
        }
    }, 800)
    onClear() {
        if (this.word) {
            this.loadSearch('')
        }
    }
}