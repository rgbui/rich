import { Block } from "../../../src/block";
import React, { CSSProperties } from 'react';
import { Icon } from "../../../component/view/icon";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { ChildsArea, TextArea, TextLineChilds } from "../../../src/block/view/appear";
import { TextTurns } from "../../../src/block/turn/text";
import { ListSvg, NumberListSvg, TriangleSvg } from "../../../component/svgs";
import { BlockChildKey } from "../../../src/block/constant";
import { DropDirection } from "../../../src/kit/handle/direction";
import { dom } from "../../../src/common/dom";
import { BlockFactory } from "../../../src/block/factory/block.factory";
import { util } from "../../../util/util";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { MenuItemView } from "../../../component/view/menu/item";
import "./style.less";
import { lst } from "../../../i18n/store";
import { Point } from "../../../src/common/vector/point";
import lodash from "lodash";

export enum ListType {
    circle = 0,
    number = 1,
    toggle = 2
}

export enum ListTypeView {
    none = 0,
    circleEmpty = 1,//空心
    rhombus = 2,//菱形
    solidRhombus = 3,//实心菱形
    alphabet = 12,//字母
    capitalLetter = 13,//大写字母
    roman = 14,//罗马
}

@url('/list')
export class List extends Block {
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    get allBlockKeys() {
        return [BlockChildKey.childs, BlockChildKey.subChilds];
    }
    @prop()
    smallFont = false;
    @prop()
    listType: ListType = ListType.circle;
    @prop()
    listView: ListTypeView = ListTypeView.none;
    @prop()
    startNumber: number = 1;
    @prop()
    expand: boolean = true;
    display = BlockDisplay.block;
    onExpand() {
        /**
         * 当前元素会折叠
         */
        this.onUpdateProps({ expand: !this.expand }, { range: BlockRenderRange.self });
    }
    get isExpand() {
        return this.blocks.subChilds.length > 0 && !(this.listType == ListType.toggle && this.expand == false)
    }
    get isContinuouslyCreated() {
        return true;
    }
    get continuouslyProps() {
        return {
            expand: false,
            listType: this.listType,
            listView: this.listView,
        }
    }
    get appearAnchors() {
        if (this.childs.length > 0) return []
        return this.__appearAnchors;
    }
    isVisbileKey(key: BlockChildKey) {
        if (this.listType == ListType.toggle) {
            if (this.expand == false && key == BlockChildKey.subChilds) return false;
        }
        return super.isVisibleKey(key);
    }
    async onGetTurnUrls() {
        var urls = TextTurns.urls;
        // if (this.listType == ListType.arrow) urls.remove('/list?{listType:2}')
        // else if (this.listType == ListType.number) urls.remove('/list?{listType:1}')
        // else if (this.listType == ListType.circle) urls.remove('/list?{listType:0}')
        return urls;
    }
    async getWillTurnData(url: string) {
        return await TextTurns.turn(this, url);
    }
    get isBackspaceAutomaticallyTurnText() {
        return true;
    }
    get contentEl() {
        if (this.el) return this.el.querySelector('[data-block-content]') as HTMLElement;
        else return this.el;
    }
    async getPlain(this: Block) {
        if (this.childs.length > 0) return await this.getChildsPlain();
        else return this.content + await this.getChildsPlain();
    }
    dropEnter(this: Block, direction: DropDirection) {
        var el = this.contentEl;
        var dire = DropDirection[direction];
        var className = 'shy-block-drag-over-' + dire;
        if (!el.classList.contains(className)) {
            dom(el).removeClass(g => g.startsWith('shy-block-drag-over'));
            el.classList.add(className);
        }
    }
    dropLeave(this: Block) {
        var el = this.contentEl;
        dom(el).removeClass(g => g.startsWith('shy-block-drag-over'));
    }
    getUrl() {
        return BlockFactory.stringBlockUrl(this.url, { listType: this.listType });
    }
    async getHtml() {
        return `${await this.getChildsHtml()}`
    }
    async getChildsHtml() {
        var currentDiv = '';
        var subDiv = '';
        if (this.childs.length > 0) currentDiv = (`<p>${(await this.childs.asyncMap(async b => { return await b.getHtml() })).join("")}</p>`)
        else currentDiv = (`<p>${this.content}</p>`);
        if (this.subChilds.length > 0)
            subDiv = (`<p>${(await this.subChilds.asyncMap(async b => { return await b.getHtml() })).join("")}</p>`)
        return `<div>${currentDiv + subDiv}</div>`;
    }
    async getMd() {
        return await this.getChildsMd();
    }
    async getChildsMd() {
        var ps: string[] = [];
        if (this.childs.length > 0) ps.push('* ' + (await this.childs.asyncMap(async b => {
            return await b.getMd()
        })).join(""));
        else ps.push('* ' + this.content);
        ps.push('\t' + (await this.subChilds.asyncMap(async b => {
            return await b.getMd()
        })).join("  \n"));
        return ps.join("  \n");
    }
    async onGetContextMenus() {
        var items = await super.onGetContextMenus();
        var at = items.findIndex(g => g.name == 'color');
        items.splice(items.findIndex(g => g.name == BlockDirective.link), 0, {
            name: 'smallFont',
            type: MenuItemType.switch,
            checked: this.smallFont ? true : false,
            text: lst('小字号'),
            icon: { name: 'byte', code: 'add-text' }
        });

        if (this.listType == ListType.circle || this.listType == ListType.number) {
            var rc = (item: MenuItem<string>, view?: MenuItemView) => {
                if (this.listType == ListType.circle) {
                    return <div className="size-20 flex-center flex-inline">
                        {item.value == ListTypeView.none && <i className="flex size-6 circle" style={{ backgroundColor: 'rgb(55,53,47)' }}></i>}
                        {item.value == ListTypeView.circleEmpty && <i className="flex size-5 circle" style={{ border: '1px solid rgb(55,53,47)' }}></i>}
                        {item.value == ListTypeView.rhombus && <i className="flex size-4 " style={{ transformOrigin: '50% 50%', transform: 'rotate(45deg)', border: '1px solid rgb(55,53,47)' }}></i>}
                        {item.value == ListTypeView.solidRhombus && <i className="flex size-6 " style={{ transformOrigin: '50% 50%', transform: 'rotate(45deg)', backgroundColor: 'rgb(55,53,47)' }}></i>}
                    </div>
                }
                else {
                    return <div className="size-20 flex-center flex-inline">
                        {item.value == ListTypeView.none && <>1.</>}
                        {item.value == ListTypeView.alphabet && <>a.</>}
                        {item.value == ListTypeView.capitalLetter && <>A.</>}
                        {item.value == ListTypeView.roman && <>i.</>}
                    </div>
                }
            }
            var newItems: MenuItem<string>[] = [
                {
                    icon: this.listType == ListType.circle ? ListSvg : NumberListSvg,
                    text: this.listType == ListType.number ? lst("数字列表符号") : lst('列表符号'),
                    childs: this.listType == ListType.circle ? [
                        { name: 'listView', renderIcon: rc, checkLabel: this.listView == ListTypeView.none, text: lst('实心园'), value: ListTypeView.none },
                        { name: 'listView', renderIcon: rc, checkLabel: this.listView == ListTypeView.circleEmpty, text: lst('空心园'), value: ListTypeView.circleEmpty },
                        { name: 'listView', renderIcon: rc, checkLabel: this.listView == ListTypeView.solidRhombus, text: lst('实心菱形'), value: ListTypeView.solidRhombus },
                        { name: 'listView', renderIcon: rc, checkLabel: this.listView == ListTypeView.rhombus, text: lst('空心菱形'), value: ListTypeView.rhombus },
                    ] : [
                        { name: 'listView', renderIcon: rc, checkLabel: this.listView == ListTypeView.none, text: lst('数字'), value: ListTypeView.none },
                        { name: 'listView', renderIcon: rc, checkLabel: this.listView == ListTypeView.alphabet, text: lst('小写字母'), value: ListTypeView.alphabet },
                        { name: 'listView', renderIcon: rc, checkLabel: this.listView == ListTypeView.capitalLetter, text: lst('大写字母'), value: ListTypeView.capitalLetter },
                        { name: 'listView', renderIcon: rc, checkLabel: this.listView == ListTypeView.roman, text: lst('罗马'), value: ListTypeView.roman }
                    ]
                }, { type: MenuItemType.divide }]
            items.splice(at, 0, ...newItems)
        }
        lodash.remove(items, c => c.name == 'text-center');

        return items;
    }
    async onClickContextMenu(item: MenuItem<BlockDirective | string>, event: MouseEvent) {
        if (item.name == 'listView') {
            await this.page.onAction('onChangeListView', async () => {
                var ps = this.parentBlocks;
                var at = this.at;
                var rs = ps.findAllBefore(at, g => (g as List).listType == this.listType && (g as List).listView == this.listView);
                var gs = ps.findAllAfter(at, g => (g as List).listType == this.listType && (g as List).listView == this.listView);
                var cs = [...rs, this, ...gs];
                await cs.eachAsync(async g => {
                    await g.updateProps({ listView: item.value as ListTypeView })
                });
                this.page.addBlockUpdate(this.parent);
            })
        }
        else await super.onClickContextMenu(item, event);
    }
    getVisibleHandleCursorPoint(): Point {
        var point = super.getVisibleHandleCursorPoint()
        point = point.move(0, -3);
        return point;
    }
    async onContextMenuInput(this: Block, item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'smallFont') {
            await this.onUpdateProps({ smallFont: item.checked }, { range: BlockRenderRange.self });
        }
        else await super.onContextMenuInput(item);
    }
}

@view('/list')
export class ListView extends BlockView<List>{
    renderListType() {
        if (this.block.listType == ListType.circle) return <span style={{ height: this.block.page.lineHeight }} className='sy-block-list-text-type'>
            {this.block.listView == ListTypeView.none && <i className="flex size-6 circle" style={{ backgroundColor: 'rgb(55,53,47)' }}></i>}
            {this.block.listView == ListTypeView.circleEmpty && <i className="flex size-5 circle" style={{ border: '1px solid rgb(55,53,47)' }}></i>}
            {this.block.listView == ListTypeView.rhombus && <i className="flex size-4 " style={{ transformOrigin: '50% 50%', transform: 'rotate(45deg)', border: '1px solid rgb(55,53,47)' }}></i>}
            {this.block.listView == ListTypeView.solidRhombus && <i className="flex size-6 " style={{ transformOrigin: '50% 50%', transform: 'rotate(45deg)', backgroundColor: 'rgb(55,53,47)' }}></i>}
        </span>
        else if (this.block.listType == ListType.toggle) {
            return <span className='sy-block-list-text-type text ts-transform round item-hover'
                style={{
                    cursor: 'pointer',
                    transform: this.block.expand ? 'rotateZ(180deg)' : 'rotateZ(90deg)',
                    height: this.block.page.lineHeight,
                }} onMouseDown={e => {
                    e.stopPropagation();
                    this.block.onExpand();
                }}>
                <Icon size={10} icon={TriangleSvg}></Icon>
            </span>
        }
        else if (this.block.listType == ListType.number) {
            var pas = this.block.parentBlocks;
            var at = pas.findIndex(g => g === this.block);
            var list: List[] = [];
            for (let i = at - 1; i >= 0; i--) {
                var prevRow = pas[i];
                if (prevRow && prevRow instanceof List && prevRow.listType == this.block.listType && prevRow.listView == this.block.listView) {
                    list.push(prevRow);
                }
                else break
            }
            var num = 0;
            if (list.length > 0)
                num = (list.last().startNumber || 1) - 1 + list.length;
            else num = (this.block.startNumber || 1) - 1;
            var str = (num + 1).toString();
            if (this.block.listView == ListTypeView.alphabet) {
                str = util.decimalToLetter(num + 1);
            }
            else if (this.block.listView == ListTypeView.capitalLetter) {
                str = util.decimalToLetter(num + 1).toUpperCase();
            }
            else if (this.block.listView == ListTypeView.roman) {
                str = util.convertToRoman(num + 1).toLowerCase()
            }
            return <span style={{
                fontStyle: 'normal',
                textDecoration: 'none',
                //color: 'var(--text-color)',
                fontWeight: 'normal'
            }} className='sy-block-list-text-type'>{str}.</span>
        }
    }
    renderText() {

        var text = this.block.listType == ListType.circle ? lst("列表") : lst("数字列表");
        if (this.block.listType == ListType.toggle) text = lst('折叠列表');
        if (this.block.childs.length > 0) return <TextLineChilds childs={this.block.childs}></TextLineChilds>
        else return <TextArea block={this.block} placeholderEmptyVisible prop='content' placeholder={text}></TextArea>
    }
    renderView() {
        var contentStyle: CSSProperties = this.block.contentStyle;
        if (this.block.smallFont) {
            contentStyle.fontSize = this.block.page.smallFont ? '12px' : '14px';
        }
        return <div className='sy-block-list'>
            <div style={this.block.visibleStyle}>
                <div className='sy-block-list-text' data-block-content style={contentStyle}>
                    {this.renderListType()}
                    <div className='sy-block-list-text-content'>{this.renderText()}</div>
                </div>
            </div>
            {this.block.isExpand && <div className='sy-block-list-subs'>
                <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
            </div>}
        </div>
    }
}