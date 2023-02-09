import React from "react";
import { TableSchema } from "../../blocks/data-grid/schema/meta";
import { Singleton } from "../../component/lib/Singleton";
import { ElementType, parseElementUrl } from "../../net/element.type";
import { KeyboardCode } from "../../src/common/keys";
import { Point, Rect } from "../../src/common/vector/point";
import { InputTextPopSelector } from "../common/input.pop";
import { ConvertEmbed } from "./embed.url";
import "./style.less";

class InputUrlSelector extends InputTextPopSelector {
    onClose(): void {
        this.close();
    }
    private _select: (blockData: Record<string, any>) => void;
    private url: string;
    async open(round: Rect, text: string, callback: (...args: any[]) => void): Promise<boolean> {
        if (this.url) { this.close(); return false; }
        this.urlTexts = [
            { text: '网址', name: 'url', url: '/text', isLine: true },
            { text: '书签', name: 'bookmark', url: '/bookmark' },
            { text: '嵌入', name: 'embed', url: '/embed' }
        ];
        this.url = text;
        var ur = new window.URL(this.url);
        if (ur.pathname.endsWith('/r')) {
            try {
                var elementUrl = ur.searchParams.get('url');
                var pe = parseElementUrl(elementUrl);
                if (pe.type == ElementType.SchemaView) {
                    var ts = await TableSchema.getTableSchema(pe.id);
                    var sv = ts.views.find(c => c.id == pe.id1);
                    this.urlTexts = [
                        { text: '引用数据表格', name: 'data-grid', url: sv.url, data: { schemaId: ts.id, syncBlockId: pe.id1 } },
                        { text: '保持网址', name: 'url', url: '/text', isLine: true },
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
    private onSelect(item) {
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
    onKeydown(event: KeyboardEvent) {
        if (this.visible == true) {
            switch (event.key) {
                case KeyboardCode.ArrowDown:
                    this.keydown();
                    return true;
                case KeyboardCode.ArrowUp:
                    this.keyup();
                    return true;
                case KeyboardCode.Enter:
                    this.onSelect(this.selectUrl);
                    return true;
            }
        }
        return false;
    }
    private urlTexts: { text: string, name: string, isLine?: boolean, data?: Record<string, any>, url: string }[] = [];
    private visible: boolean = false;
    private pos: Point = new Point(0, 0);
    private selectIndex: number = 0;
    private get isSelectIndex() {
        return this.selectIndex >= 0 && this.selectIndex < this.urlTexts.length;
    }
    private get selectUrl() {
        var b = this.urlTexts[this.selectIndex];
        return b;
    }
    renderUrls() {
        return this.urlTexts.map((u, i) => {
            return <div className={'shy-url-text-item' + (i == this.selectIndex ? " selected" : "")} key={u.name} onMouseDown={e => this.onSelect(u)}>
                <a><span>{u.text}</span></a>
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
    private keydown() {
        if (!this.isSelectIndex) this.selectIndex = -1;
        if (this.selectIndex < this.urlTexts.length - 1) {
            this.selectIndex += 1;
            this.forceUpdate();
        }
    }
    /**
     * 向下选择内容
     */
    private keyup() {
        if (!this.isSelectIndex) this.selectIndex = this.urlTexts.length - 1;
        if (this.selectIndex > 0) {
            this.selectIndex -= 1;
            this.forceUpdate();
        }
    }
    private close() {
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