import React from "react";
import { Tip } from "../../component/tip";
import { langProvider } from "../../i18n/provider";

import "../../src/assert/font-awesome/less/solid.less";
import "../../src/assert/font-awesome/less/fontawesome.less";
import { fontAwesomeStore } from "./store";
import './style.less';
import { FontAwesomeIconType, FontAwesomeType } from "./declare";
import { dom } from "../../src/common/dom";
export class FontAwesomeView extends React.Component<{ loaded?: () => void, onChange: (data: { code: string, color?: string }) => void }> {
    shouldComponentUpdate(nextProps, nextStates) {
        return false;
    }
    icons: FontAwesomeType[] = [];
    color: string = '#000';
    loading: boolean = true;
    private scrollIndex = 4;
    private scrollOver: boolean = false;
    componentDidMount() {
        this.loading = true;
        fontAwesomeStore.get().then(r => {
            this.icons = r;
            this.loading = false;
            this.forceUpdate(() => {
                if (typeof this.props.loaded == 'function') this.props.loaded()
            });
        })
    }
    onChange(ic: FontAwesomeIconType) {
        if (this.props.onChange) this.props.onChange({ code: ic.name, color: this.color });
    }
    renderFontAwesomes() {
        if (this.scrollIndex > this.icons.length) this.scrollOver = true;
        return this.icons.map((icon, i) => {
            if (i > this.scrollIndex) return <div key={icon.name}></div>;
            return <div className='shy-font-awesome-category' key={icon.name}>
                <div className='shy-font-awesome-category-head'><span>{langProvider.isCn ? icon.text : icon.name}</span></div>
                <div className='shy-font-awesome-category-content'>
                    {icon.icons.map(ic => {
                        return <Tip overlay={langProvider.isCn ? ic.label : ic.name} key={ic.name}><a onMouseDown={e => this.onChange(ic)}>
                            <i className={'fa' + ' fa-' + ic.name}></i>
                        </a></Tip>
                    })}
                </div>
            </div>
        })
    }
    renderFontColors() {
        return <div className='shy-font-awesome-colors'>
            <a></a>
        </div>
    }
    render() {
        return <div className='shy-font-awesome' onScroll={e => this.onScroll(e)}>
            {this.renderFontColors()}
            {this.loading && <div className='shy-font-awesome-loading'></div>}
            {this.loading != true && <div style={{ color: this.color }} className='shy-font-awesome-content'>{this.renderFontAwesomes()}</div>}
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
}