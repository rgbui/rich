import React from "react";
import { Input } from "../../component/input";
import { LangID } from "../../i18n/declare";

import { langProvider } from "../../i18n/provider";
import { EventsComponent } from "../../component/events.component";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { PageLink } from "./declare";
import GlobalLink from "../../src/assert/svg/GlobalLink.svg";

/**
 * 
 * 输入网址，
 * 如果不是互联网址，则搜索本地的页面，同时也可以概据当前的输入的页面名称，自动创建一个新的子页面
 * 
 */
class LinkPicker extends EventsComponent<{ link: PageLink }> {
    constructor(props) {
        super(props);
        if (this.props.link && this.props.link.name == 'outside') this.url = this.props.link.url;
        else this.url = '';
        if (this.props.link) this.name = this.props.link.name;
    }
    url: string = '';
    name: PageLink['name'];
    onEnter(url) {

    }
    onInput(e) {

        /**
         * 说明是网址开头的
         */
        if (/^https?:\/\//g.test(e)) {
            this.name = 'outside';
            this.url = e;
        }
        else {
            //这里搜索
        }
    }
    render() {
        return <div className='shy-link-picker'>
            <Input
                placeholder={langProvider.getText(LangID.PleashInputLinkAndSearchPages)}
                onChange={e => this.onInput(e)}
                onEnter={e => this.onEnter(e)}
                value={this.url}></Input>
            <div className='shy-link-picker-current-page'>
                {this.name == 'outside' && <a ><GlobalLink></GlobalLink><span>{this.url}</span></a>}
            </div>
            <div className='shy-link-picker-operators'></div>
            <div className='shy-link-picker-search-pages'>

            </div>
        </div>
    }
}

export async function useLinkPicker(pos: PopoverPosition, link?: PageLink) {
    var popover = await PopoverSingleton(LinkPicker, {}, { link: link });
    var picker = await popover.open<LinkPicker>(pos);
    return new Promise((resolve: (link: PageLink) => void, reject) => {
        picker.on('change', (link: PageLink) => {
            resolve(link);
        })
        popover.on('close', () => resolve(null))
    })
}