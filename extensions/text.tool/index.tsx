import React, { CSSProperties } from "react";
import { Point, Rect, RectUtility } from "../../src/common/vector/point";
import { Icon } from "../../component/view/icon";
import { TextCommand } from "./text.command";
import { EventsComponent } from "../../component/lib/events.component";
import { BlockCssName, FillCss } from "../../src/block/pattern/css";
import { LangID } from "../../i18n/declare";
import { Tip } from "../../component/view/tooltip/tip";
import { useLinkPicker } from "../link/picker";
import { useColorSelector } from "../color";
import { Block } from "../../src/block";
import { useSelectMenuItem } from "../../component/view/menu";
import { Singleton } from "../../component/lib/Singleton";
import { MenuItem } from "../../component/view/menu/declare";
import { BlockDirective } from "../../src/block/enum";
import { PopoverPosition } from "../popover/position";
import { FixedViewScroll } from "../../src/common/scroll";
import { blockStore } from "../block/store";
import { BoldSvg, CodeSvg, DeleteLineSvg, DoubleLinkSvg, EquationSvg, FontStyleSvg, ItalicSvg, LinkSvg, SearchSvg, UnderlineSvg } from "../../component/svgs";
import { ToolTip } from "../../component/view/tooltip";
import { useSearchBox } from "../search";

export type TextToolStyle = {
    link: string,
    blockUrl: string,
    bold: boolean,
    italic: boolean,
    underline: boolean,
    deleteLine: boolean,
    code: boolean,
    equation: boolean,
    color: string,
    fill: Partial<FillCss>,
    page: boolean
}

class TextTool extends EventsComponent {
    private textStyle: TextToolStyle = {} as any;
    constructor(props) {
        super(props);
        this.fvs.on('change', (offset: Point) => {
            if (this.visible == true && this.boxEl)
                this.boxEl.style.transform = `translate(${offset.x}px,${offset.y}px)`
        })
    }
    private fvs: FixedViewScroll = new FixedViewScroll();
    private turnBlock: Block = null;
    private turnText: string = '';
    private selectionText: string = '';
    el: HTMLElement;
    boxEl: HTMLElement;
    open(pos: PopoverPosition, options: { style: TextToolStyle, turnBlock?: Block }) {
        var rs = pos.roundArea;
        if (!rs && Array.isArray(pos.roundAreas)) rs = pos.roundAreas[0];
        console.log(pos.relativeEleAutoScroll, 'sss');
        if (pos.relativeEleAutoScroll) this.fvs.bind(pos.relativeEleAutoScroll);
        this.point = rs.leftTop;
        this.visible = true;
        this.textStyle = options.style;
        this.turnBlock = options?.turnBlock;
        var tb = this.turnBlock ? blockStore.find(g => g.url == this.turnBlock.url) : undefined;
        if (tb) this.turnText = tb.text;
        else this.turnText = '';
        this.selectionText = window.getSelection().toString();
        this.forceUpdate(() => {
            var menu: HTMLElement = this.el.querySelector('.shy-tool-text-menu');
            this.point = RectUtility.cacPopoverPosition({
                roundArea: new Rect(this.point.x, this.point.y, 20, 30),
                elementArea: Rect.from(menu.getBoundingClientRect()),
                direction: "top",
                dist: 10
            });
            this.forceUpdate();
        });
    }
    close() {
        if (this.visible == true) {
            this.fvs.unbind();
            this.visible = false;
            this.forceUpdate();
            this.emit('close');
        }
    }
    visible: boolean = false;
    private point: Point = new Point(0, 0);
    render() {
        var style: CSSProperties = {
            top: this.point.y,
            left: this.point.x
        };
        return <div tabIndex={1} data-shy-page-unselect="true" onMouseUp={e => e.stopPropagation()} ref={el => this.el = el}>{this.visible == true && <div className='shy-tool-text-menu' ref={e => this.boxEl = e} style={style}>
            {this.turnBlock && this.turnText && <Tip id={LangID.textToolTurn}>
                <div className='shy-tool-text-menu-item shy-tool-text-menu-devide' onMouseDown={e => this.onOpenBlockSelector(e)}>
                    <span>{this.turnText}</span><Icon icon='arrow-down:sy'></Icon>
                </div>
            </Tip>}
            <Tip id={LangID.textToolLink}>
                <div className='shy-tool-text-menu-item shy-tool-text-menu-devide' onMouseDown={e => this.onOpenLink(e)}>
                    <Icon size={16} icon={LinkSvg}></Icon>
                    <Icon icon='arrow-down:sy'></Icon>
                </div>
            </Tip>
            {/* <Tip id={LangID.textToolComment}>
                        <div className='shy-tool-text-menu-item shy-tool-text-menu-devide' onMouseDown={e => this.onOpenComment(e)}>
                            <Icon icon='comment:sy'></Icon>
                        </div>
                    </Tip> */}
            <Tip id={LangID.textToolBold}>
                <div className={'shy-tool-text-menu-item' + (this.textStyle.bold == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.bold == true ? TextCommand.cancelBold : TextCommand.bold, e)}>
                    <Icon size={16} icon={BoldSvg}></Icon>
                </div>
            </Tip>
            <Tip id={LangID.textToolItailc}>
                <div className={'shy-tool-text-menu-item' + (this.textStyle.italic == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.italic == true ? TextCommand.cancelItalic : TextCommand.italic, e)}>
                    <Icon size={16} icon={ItalicSvg}></Icon>
                </div>
            </Tip>
            <Tip id={LangID.textToolUnderline}>
                <div className={'shy-tool-text-menu-item' + (this.textStyle.underline == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.underline == true ? TextCommand.cancelLine : TextCommand.underline, e)}>
                    <Icon size={16} icon={UnderlineSvg}></Icon>
                </div>
            </Tip>
            <Tip id={LangID.textToolDeleteLine}>
                <div className={'shy-tool-text-menu-item' + (this.textStyle.deleteLine == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.deleteLine == true ? TextCommand.cancelLine : TextCommand.deleteLine, e)}>
                    <Icon size={16} icon={DeleteLineSvg}></Icon>
                </div>
            </Tip>
            <Tip id={LangID.textToolCode}>
                <div className={'shy-tool-text-menu-item' + (this.textStyle.code == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.code == true ? TextCommand.cancelCode : TextCommand.code, e)}>
                    <Icon size={16} icon={CodeSvg}></Icon>
                </div>
            </Tip>
            <Tip id={LangID.textToolEquation}>
                <div className={'shy-tool-text-menu-item' + (this.textStyle.equation == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.equation == true ? TextCommand.cancelEquation : TextCommand.equation, e)}>
                    <Icon size={16} icon={EquationSvg}></Icon>
                </div>
            </Tip>
            <Tip id={LangID.textToolColor}>
                <div className='shy-tool-text-menu-item' onMouseDown={e => this.onOpenFontColor(e)}>
                    <Icon size={16} icon={FontStyleSvg}></Icon>
                    <Icon size={16} icon='arrow-down:sy'></Icon>
                </div>
            </Tip>
            <ToolTip overlay={'双链'} >
                <div className={'shy-tool-text-menu-item' + (this.textStyle.page == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.page != true ? TextCommand.doubleLink : undefined, e)}>
                    <Icon size={22} icon={DoubleLinkSvg}></Icon>
                </div>
            </ToolTip>
            <ToolTip overlay={'搜索'}>
                <div className="shy-tool-text-menu-item" onMouseDown={e => this.onSearch(e)}>
                    <Icon size={16} icon={SearchSvg}></Icon>
                </div>
            </ToolTip>
        </div>}
        </div>;
    }
    onExcute(command: TextCommand, event: React.MouseEvent) {
        var font: Record<string, any> = {};
        if (typeof command == 'undefined') return;
        switch (command) {
            case TextCommand.bold:
                font.fontWeight = 'bold';
                this.textStyle.bold = true;
                break;
            case TextCommand.cancelBold:
                font.fontWeight = 'normal';
                this.textStyle.bold = false;
                break;
            case TextCommand.italic:
                font.fontStyle = 'italic';
                this.textStyle.italic = true;
                break;
            case TextCommand.cancelItalic:
                font.fontStyle = 'normal';
                this.textStyle.italic = false;
                break;
            case TextCommand.deleteLine:
                font.textDecoration = 'line-through';
                this.textStyle.deleteLine = true;
                break;
            case TextCommand.underline:
                font.textDecoration = 'underline';
                this.textStyle.underline = true;
                break;
            case TextCommand.cancelLine:
                font.textDecoration = 'none';
                this.textStyle.deleteLine = false;
                this.textStyle.underline = false;
                break;
            case TextCommand.code:
                this.textStyle.code = true;
                this.emit('setProp', { code: true });
                return this.forceUpdate();
                break;
            case TextCommand.cancelCode:
                this.textStyle.code = false;
                this.emit('setProp', { code: false });
                return this.forceUpdate();
                break;
            case TextCommand.equation:
                this.textStyle.equation = true;
                this.emit('setEquation', { equation: true })
                return this.forceUpdate();
                break;
            case TextCommand.cancelEquation:
                this.textStyle.equation = false;
                this.emit('setProp', { equation: false });
                return this.forceUpdate();
                break;
            case TextCommand.doubleLink:
                this.textStyle.page = false;
                this.emit('setProp', { link: { name: 'page' } });
                return this.forceUpdate();
                break;
        }
        this.emit('setStyle', { [BlockCssName.font]: font } as any);
        this.forceUpdate();
    }
    async onOpenFontColor(event: React.MouseEvent) {
        event.stopPropagation();
        this.blocked = true;
        var fontColor = await useColorSelector({ roundArea: Rect.fromEvent(event) }, {
            color: this.textStyle.color,
            backgroundColor: this.textStyle.fill?.color
        });
        this.blocked = false;
        if (fontColor) {
            var font: Record<string, any> = {};
            if (fontColor.color) {
                this.textStyle.color = fontColor.color;
                font.color = fontColor.color;
                this.emit('setStyle', { [BlockCssName.font]: font } as any);
            }
            else if (fontColor.backgroundColor) {
                this.textStyle.fill = { mode: 'color', color: fontColor.backgroundColor }
                this.emit('setStyle', { [BlockCssName.fill]: this.textStyle.fill } as any);
            }
        }
    }
    async onOpenLink(event: React.MouseEvent) {
        event.stopPropagation();
        this.blocked = true;
        var pageLink = await useLinkPicker({ roundArea: Rect.fromEvent(event) });
        this.blocked = false;
        if (pageLink) {
            if (pageLink.name == 'create') {
                if (!pageLink.text && pageLink.url)
                    pageLink.text = pageLink.url;
            }
            this.emit('setProp', { link: pageLink });
        }
    }
    onOpenComment(event: React.MouseEvent) {

    }
    onSearch(event: React.MouseEvent) {
        if (this.selectionText) {
            //这里打开搜索框
            useSearchBox({ word: this.selectionText, isNav: true })
        }
    }
    componentDidMount() {
        document.addEventListener('mousedown', this.onGlobalMousedown);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onGlobalMousedown);
    }
    async onOpenBlockSelector(event: React.MouseEvent) {
        event.stopPropagation();
        var block = this.turnBlock;
        this.blocked = true;
        var re = await useSelectMenuItem({
            roundArea: Rect.fromEvent(event),
            direction: 'left'
        }, await block.onGetTurnMenus());
        this.blocked = false;
        if (re) {
            this.emit('turn', re.item, re.event);
        }
    }
    blocked: boolean = false;
    onGlobalMousedown = (event: MouseEvent) => {
        if (this.blocked == true) return;
        if (this.visible == true && this.el) {
            var target = event.target as HTMLElement;
            if (this.el.contains(target)) return;
            this.close();
        }
    }

}
interface TextTool {
    emit(name: 'setStyle', styles: Record<BlockCssName, Record<string, any>>);
    emit(name: 'setProp', props: Record<string, any>);
    emit(name: 'setEquation', props: Record<string, any>);
    emit(name: 'turn', item: MenuItem<BlockDirective>, event: MouseEvent);
    emit(name: 'close');
    only(name: 'setProp', props: Record<string, any>);
    only(name: 'setEquation', props: Record<string, any>);
    only(name: 'setStyle', fn: (syles: Record<BlockCssName, Record<string, any>>) => void);
    only(name: 'turn', fn: (item: MenuItem<BlockDirective>, event: MouseEvent) => void);
    only(name: 'close', fn: () => void);
}
export type textToolResult = { command: 'setStyle', styles: Record<BlockCssName, Record<string, any>> }
    | { command: 'turn', item: MenuItem<BlockDirective>, event: MouseEvent }
    | { command: "setProp", props: Record<string, any> }
    | { command: 'setEquation', props: { equation: boolean } }
    | false;
var textTool: TextTool;
export async function useTextTool(point: PopoverPosition, options: { style: TextToolStyle, turnBlock?: Block }) {
    textTool = await Singleton(TextTool);
    textTool.open(point, options);
    return new Promise((resolve: (result: textToolResult) => void, reject) => {
        textTool.only('setStyle', (styles) => {
            resolve({ command: 'setStyle', styles })
        });
        textTool.only('setProp', (props) => {
            resolve({ command: 'setProp', props })
        })
        textTool.only('setEquation', (props) => {
            resolve({ command: 'setEquation', props })
        })
        textTool.only('setProp', (props) => {
            resolve({ command: 'setProp', props })
        })
        //textTool.only
        textTool.only("turn", (item, event) => {
            resolve({ command: 'turn', item, event })
        });
        textTool.only("close", () => {
            resolve(false);
        })
    })
}
export function forceCloseTextTool() {
    if (textTool)
        textTool.close();
}
export function isBlockedTextTool() {
    if (textTool) return textTool.blocked;
    return false;
}