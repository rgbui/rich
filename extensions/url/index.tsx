import React from "react";
import { TableSchema } from "../../blocks/data-grid/schema/meta";
import { Singleton } from "../../component/lib/Singleton";
import { ElementType, parseElementUrl } from "../../net/element.type";
import { KeyboardCode } from "../../src/common/keys";
import { Rect } from "../../src/common/vector/point";
import { InputTextPopSelector } from "../common/input.pop";
import { ConvertEmbed } from "./embed.url";
import "./style.less";
import { BookSvg, EmbedSvg, LinkSvg, TableSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { IconArguments } from "../icon/declare";
import B from "../../src/assert/img/bilibili.ico";
import M from "../../src/assert/img/163.music.ico";
class InputUrlSelector extends InputTextPopSelector {
    onClose(): void {
        this.close();
    }
    private url: string;
    async open(round: Rect, text: string, callback: (...args: any[]) => void): Promise<boolean> {
        if(this.url) { this.close(); return false; }
        this.urlTexts = [
            { icon: LinkSvg, text: '网址', name: 'url', url: '/text', isLine: true },
            { icon: BookSvg, text: '书签', name: 'bookmark', url: '/bookmark' },
            { icon: EmbedSvg, text: '嵌入', name: 'embed', url: '/embed' }
        ];
        this.url = text;
        var cr = ConvertEmbed(this.url);
        if (cr?.embedType) {
            this.urlTexts = [
                { icon: LinkSvg, text: '网址', name: 'url', url: '/text', isLine: true },
                { icon: BookSvg, text: '书签', name: 'bookmark', url: '/bookmark' },
                {
                    icon: { name: 'image', url: cr?.embedType == 'music.163' ? M : B },
                    text: cr?.embedType == 'music.163' ? "嵌入网易云音乐" : '嵌入B站',
                    name: 'embed',
                    url: '/embed'
                }
            ];
        }
        var ur = new window.URL(this.url);
        if (ur.pathname.endsWith('/r')) {
            try {
                var elementUrl = ur.searchParams.get('url');
                var pe = parseElementUrl(elementUrl);
                if (pe.type == ElementType.SchemaView) {
                    var ts = await TableSchema.getTableSchema(pe.id);
                    var sv = ts.views.find(c => c.id == pe.id1);
                    this.urlTexts = [
                        { icon: TableSvg, text: '引用数据表格', name: 'data-grid', url: sv.url, data: { schemaId: ts.id, syncBlockId: pe.id1 } },
                        { icon: LinkSvg, text: '保持网址', name: 'url', url: '/text', isLine: true },
                    ]
                }
            }
            catch (ex) {

            }
        }
        this.pos = round.leftBottom;
        this.selectIndex = 0;
        this.visible = true;
        this._select = callback;
        this.forceUpdate();
        return true;
    }
    onSelect(item, isReturn?: boolean) {
        try {
            if (typeof this._select == 'function') {
                var ut = this.urlTexts.find(c => c.name == item.name);
                var props: Record<string, any> = {};
                if (item.url == '/text') {
                    props.content = this.url;
                    props.link = { url: this.url }
                }
                else if (item.url == '/embed') {
                    var ru = ConvertEmbed(this.url);
                    props.src = { name: 'link', url: ru.url };
                    props.embedType = ru.embedType;
                    props.origin = ru.origin;
                }
                else if (item.url == '/bookmark') { props.bookmarkUrl = this.url; }
                else if (item.name == 'data-grid') {
                    Object.assign(props, ut.data);
                }
                if (isReturn) {
                    return {
                        url: item.url,
                        isLine: item.isLine,
                        ...props
                    }
                }
                else
                    this._select({
                        url: item.url,
                        isLine: item.isLine,
                        ...props
                    });
            }
        }
        catch (ex) {
            console.error(ex);
        }
        finally {
            this.close();
        }
    }
    onKeydown(event: KeyboardEvent)
    {
        if (this.visible == true) {
            switch (event.key) {
                case KeyboardCode.ArrowDown:
                    this.keydown(event);
                    return true;
                case KeyboardCode.ArrowUp:
                    this.keyup(event);
                    return true;
                case KeyboardCode.Enter:
                    var se = this.onSelect(this.selectUrl, true);
                    if (se) {
                        return {
                            blockData: se
                        };
                    }
                    else return false;
            }
        }
        return false;
    }
    private urlTexts: { text: string, icon?: string | IconArguments | JSX.Element | SvgrComponent, name: string, isLine?: boolean, data?: Record<string, any>, url: string }[] = [];
    private get selectUrl() {
        var b = this.urlTexts[this.selectIndex];
        return b;
    }
    renderUrls() {
        return this.urlTexts.map((u, i) => {
            return <div className={'flex item-hover padding-w-10 padding-h-5 cursor' + (i == this.selectIndex ? " item-hover-focus" : "")} key={u.name} onMouseDown={e => this.onSelect(u)}>
                <span className="flex-fixed size-24 flex-center item-hover round "><Icon size={18} icon={u.icon}></Icon></span>
                <span className="flex-auto">{u.text}</span>
            </div>
        })
    }
    render() {
        var style: Record<string, any> = {
            top: this.pos.y,
            left: this.pos.x
        }
        return <div>
            {this.visible && <div className='shy-url-selector'
                style={style}>{this.renderUrls()}</div>}
        </div>
    }
    /**
     * 向上选择内容
    */
    keydown(e) {
        if (this.selectIndex == this.urlTexts.length - 1) {

        }
        else {
            this.selectIndex += 1;
        }
        this.forceUpdate();
        return true;
    }
    /**
     * 向下选择内容
     */
    keyup(event) {
        if (this.selectIndex == 0) {

        }
        else {
            this.selectIndex -= 1;
        }
        this.forceUpdate();
        return true;
    }
    close() {
        this.url = '';
        if (this.visible == true) {
            this.visible = false;
            this.forceUpdate();
        }
    }
}

export async function useInputUrlSelector() {
    return await Singleton(InputUrlSelector);
}