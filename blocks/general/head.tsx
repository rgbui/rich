import { BlockView } from "../../src/block/view";
import { prop, url, view } from "../../src/block/factory/observable";
import React from 'react';
import { ChildsArea, TextSpanArea } from "../../src/block/view/appear";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { Block } from "../../src/block";
import { TextTurns } from "../../src/block/turn/text";
import { Point, Rect } from "../../src/common/vector/point";
import { BlockFactory } from "../../src/block/factory/block.factory";
import { dom } from "../../src/common/dom";
import { Icon } from "../../component/view/icon";
import { TriangleSvg } from "../../component/svgs";
import { BlockChildKey, BlockUrlConstant } from "../../src/block/constant";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import lodash from "lodash";
import { DropDirection } from "../../src/kit/handle/direction";

@url('/head')
export class Head extends Block {
    blocks: { childs: Block[], subChilds: Block[] } = { childs: [], subChilds: [] };
    get allBlockKeys() {
        return [BlockChildKey.childs, BlockChildKey.subChilds];
    }
    get hasSubChilds() {
        if (this.toggle) return true;
        return false;
    }
    @prop()
    align: 'left' | 'center' = 'left';
    @prop()
    level: 'h1' | 'h2' | 'h3' | 'h4' = 'h1';
    @prop()
    toggle: boolean = false;
    @prop()
    expand: boolean = true;
    get isDisabledInputLine() {
        return false;
    }
    get appearAnchors() {
        if (this.childs.length > 0) return []
        return this.__appearAnchors;
    }
    display = BlockDisplay.block;
    async onGetTurnUrls() {
        var urls = TextTurns.urls;
        //if (this.level == 'h2') urls.remove('/head?{level:"h2"}')
        //else if (this.level == 'h3') urls.remove('/head?{level:"h3"}')
        return urls;
    }
    async getWillTurnData(url: string) {
        return await TextTurns.turn(this, url);
    }
    async getPlain(this: Block) {
        if (this.childs.length > 0)
            return await this.getChildsPlain();
        else return this.content;
    }
    getVisibleHandleCursorPoint() {
        var h = this.el.querySelector('.relative') as HTMLElement;
        var bound = Rect.fromEle(h);
        if (bound) {
            var pos = Point.from(bound);
            var lh = parseFloat(dom(h).style('lineHeight'));
            pos = pos.move(0, 3 + lh / 2);
            return pos;
        }
    }
    async getHtml() {
        var tag = this.level;
        if (this.childs.length > 0) return `<${tag}>${this.getChildsHtml()}</${tag}>`
        else return `<${tag}>${this.content}</${tag}>`
    }
    getUrl(): string {
        return BlockFactory.stringBlockUrl(this.url, { level: this.level });
    }
    async getMd() {
        var tag = '#';
        if (this.level == 'h2') tag = '##'
        else if (this.level == 'h3') tag = '###'
        else if (this.level == 'h4') tag = '####'
        if (this.childs.length > 0) return tag + '  ' + (await (this.childs.asyncMap(async b => await b.getMd()))).join('') + "  "
        else return tag + ' ' + this.content + "  "
    }
    onExpand() {
        /**
         * 当前元素会折叠
         */
        this.onUpdateProps({ expand: !this.expand }, { range: BlockRenderRange.self });
    }
    get isExpand() {
        return this.blocks.subChilds.length > 0 && this.toggle == true && this.expand == true
    }
    async onGetContextMenus() {
        if (this.isFreeBlock) {
            return await this.onGetBoardContextMenus()
        }
        var rs = await super.onGetContextMenus();
        var at = rs.findIndex(g => g.name == 'text-center');
        if (this.toggle == true)
            lodash.remove(rs, g => g.name == 'text-center');
        rs.splice(at,0,{
            name: 'toggle',
            text: '折叠标题',
            icon: { name: 'bytedance-icon', code: 'handle-right' },
            type: MenuItemType.switch,
            checked: this.toggle
        })
        return rs;
    }
    async onContextMenuInput(item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'toggle') {
            await this.page.onAction('toggleHead', async () => {
                var toggle = item.checked;
                var rs = toggle == false ? this.subChilds : [];
                if (toggle == true) {
                    var at = this.parentBlocks.findIndex(g => g === this);
                    var pbs = this.parentBlocks;
                    for (let i = at + 1; i < pbs.length; i++) {
                        if (pbs[i].url != BlockUrlConstant.Head) {
                            rs.push(pbs[i])
                        }
                        else break;
                    }
                }
                if (toggle == true) {
                    await this.appendArray(rs, 0, BlockChildKey.subChilds)
                    await this.updateProps({ expand: true });
                }
                else {
                    await this.parent.appendArray(rs, this.at, this.parentKey);
                }
                await this.updateProps({ toggle })
            });
            return;
        }
        await super.onContextMenuInput(item);
    }
    isVisbileKey(key: BlockChildKey) {
        if (!this.toggle && key == BlockChildKey.subChilds) return false;
        if (this.toggle) {
            if (this.expand == false && key == BlockChildKey.subChilds) return false;
        }
        return super.isVisibleKey(key);
    }
    get contentEl() {
        if (this.el) return this.el.querySelector('[data-block-content]') as HTMLElement;
        else return this.el;
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
}
@view("/head")
export class HeadView extends BlockView<Head>{
    render() {
        var style: Record<string, any> = { fontWeight: 600 };
        if (this.block.toggle !== true) {
            if (this.props.block.align == 'center') style.textAlign = 'center';
        }
        Object.assign(style, this.block.contentStyle);
        var pt: string = '';
        var ns: string[] = [];
        var self = this;
        if (this.block.level == 'h1') {
            style.fontSize = 30
            style.lineHeight = '39px';
            style.marginTop = 32;
            style.marginBottom = '4px';
            pt = '一级标题';
            ns = [undefined]
        }
        else if (this.block.level == 'h2') {
            style.fontSize = 24;
            style.lineHeight = '31.2px';
            style.marginTop = 22;
            style.marginBottom = '1px';
            pt = '二级标题';
            ns = [undefined, undefined]
        }
        else if (this.block.level == 'h3') {
            style.fontSize = 20;
            style.lineHeight = '26px';
            style.marginTop = '1em';
            style.marginBottom = '1px';
            pt = '三级标题';
            ns = [undefined, undefined, undefined]
        }
        else if (this.block.level == 'h4') {
            style.fontSize = 16;
            style.lineHeight = '26px';
            style.marginTop = '1em';
            style.marginBottom = '1px';
            pt = '四级标题';
            ns = [undefined, undefined, undefined, undefined]
        }
        function renderHead() {
            var content = <>
                <div style={{ left: self.block.toggle ? 24 : 0 }} className="sy-block-text-head-tips pos flex-center h-10 visible r-size-3 r-gap-r-5 r-circle ">{ns.map((n, i) => <em key={i}></em>)}</div>
                <div className="flex flex-top">
                    {self.block.toggle && <span
                        className='w-24 flex-center flex-inline'
                        style={{ height: style.lineHeight }}
                    >
                        <span onMouseDown={e => {
                            e.stopPropagation();
                            self.block.onExpand();
                        }}
                            className="flex-center size-20 round item-hover cursor  text ts-transform"
                            style={{
                                transform: self.block.expand ? 'rotateZ(180deg)' : 'rotateZ(90deg)',
                            }}
                        ><Icon size={10} icon={TriangleSvg}></Icon>
                        </span>
                    </span>}
                    <span><TextSpanArea className={'shy-text-empty-font-inherit'} placeholder={pt} block={self.block}></TextSpanArea></span>
                </div>
            </>
            if (self.block.level == 'h4') {
                return <h4 style={style} className="relative">{content}</h4>
            }
            if (self.block.level == 'h3') {
                return <h4 style={style} className="relative">{content}</h4>
            }
            if (self.block.level == 'h2') {
                return <h4 style={style} className="relative">{content}</h4>
            }
            if (self.block.level == 'h1') {
                return <h4 style={style} className="relative">{content}</h4>
            }
        }
        return <div className='sy-block-text-head'>
            <div className="visible-hover" style={this.block.visibleStyle}>
                <div data-block-content style={this.block.contentStyle}>{renderHead()}</div>
            </div>
            {this.block.isExpand && <div className="sy-block-text-head-subs" style={{ paddingLeft: 24 }}>
                <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
            </div>}
        </div>
    }
}