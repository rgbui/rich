import React, { CSSProperties } from "react";
import { Point, Rect, RectUtility } from "../../src/common/point";
import { Icon } from "../../component/view/icon";
import Equation from "../../src/assert/svg/equation.svg";
import Mention from "../../src/assert/svg/mention.svg";
import { Dragger } from "../../src/common/dragger";
import { TextCommand } from "./text.command";
import { EventsComponent } from "../../component/lib/events.component";
import { BlockCssName, FillCss } from "../../src/block/pattern/css";
import { LangID } from "../../i18n/declare";
import { Tip } from "../../component/view/tip";
import { useLinkPicker } from "../link/picker";
import { useColorSelector } from "../color";
import { Block } from "../../src/block";
import { useSelectMenuItem } from "../../component/view/menu";
import { Singleton } from "../../component/lib/Singleton";
import { MenuItemType } from "../../component/view/menu/declare";
import { BlockDirective } from "../../src/block/enum";

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
    fill: Partial<FillCss>
}
class TextTool extends EventsComponent {
    private textStyle: TextToolStyle = {} as any;
    constructor(props) {
        super(props);
    }
    private block: Block = null;
    el: HTMLElement;
    open(point, options: { style: TextToolStyle, block: Block }) {
        this.point = this.point;
        this.visible = true;
        this.textStyle = options.style;
        this.block = options.block;
        this.forceUpdate(() => {
            var menu: HTMLElement = this.el.querySelector('.shy-tool-text-menu');
            this.point = RectUtility.cacPopoverPosition({
                roundArea: new Rect(point.x, point.y, 20, 30),
                elementArea: Rect.from(menu.getBoundingClientRect()),
                direction: "top",
                dist: 10
            });
            this.forceUpdate();
        });
    }
    close() {
        if (this.visible == true) {
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
        return <div tabIndex={1} data-shy-page-unselect="true" onMouseUp={e => e.stopPropagation()} ref={el => this.el = el}>{this.visible == true && <div className='shy-tool-text-menu' style={style}>
            <Tip id={LangID.textToolTurn}>
                <div className='shy-tool-text-menu-item shy-tool-text-menu-devide' onMouseDown={e => this.onOpenBlockSelector(e)}>
                    <span>Text</span><Icon icon='arrow-down:sy'></Icon>
                </div>
            </Tip>
            {/* <Tip id={LangID.textToolLink}>
                        <div className='shy-tool-text-menu-item shy-tool-text-menu-devide' onMouseDown={e => this.onOpenLink(e)}>
                            <Icon icon='link:sy'></Icon><Icon icon='arrow-down:sy'></Icon>
                        </div>
                    </Tip> */}
            {/* <Tip id={LangID.textToolComment}>
                        <div className='shy-tool-text-menu-item shy-tool-text-menu-devide' onMouseDown={e => this.onOpenComment(e)}>
                            <Icon icon='comment:sy'></Icon>
                        </div>
                    </Tip> */}
            <Tip id={LangID.textToolBold}>
                <div className={'shy-tool-text-menu-item' + (this.textStyle.bold == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.bold == true ? TextCommand.cancelBold : TextCommand.bold)}>
                    <Icon icon='bold:sy'></Icon>
                </div>
            </Tip>
            <Tip id={LangID.textToolItailc}>
                <div className={'shy-tool-text-menu-item' + (this.textStyle.italic == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.italic == true ? TextCommand.cancelItalic : TextCommand.italic)}>
                    <Icon icon='italic:sy'></Icon>
                </div>
            </Tip>
            <Tip id={LangID.textToolUnderline}>
                <div className={'shy-tool-text-menu-item' + (this.textStyle.underline == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.underline == true ? TextCommand.cancelLine : TextCommand.underline)}>
                    <Icon icon='underline:sy'></Icon>
                </div>
            </Tip>
            <Tip id={LangID.textToolDeleteLine}>
                <div className={'shy-tool-text-menu-item' + (this.textStyle.deleteLine == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.deleteLine == true ? TextCommand.underline : TextCommand.deleteLine)}>
                    <Icon icon='delete-line:sy'></Icon>
                </div>
            </Tip>
            <Tip id={LangID.textToolCode}>
                <div className={'shy-tool-text-menu-item' + (this.textStyle.code == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.code == true ? TextCommand.cancelCode : TextCommand.code)}>
                    <Icon icon='code:sy'></Icon>
                </div>
            </Tip>
            {/* <Tip id={LangID.textToolEquation}>
                        <div className={'shy-tool-text-menu-item' + (this.textStyle.equation == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.equation == true ? TextCommand.cancelEquation : TextCommand.equation)}>
                            <Icon icon={Equation}></Icon>
                        </div>
                    </Tip> */}
            <Tip id={LangID.textToolColor}>
                <div className='shy-tool-text-menu-item' onMouseDown={e => this.onOpenFontColor(e)}>
                    <span>A</span>
                    <Icon icon='arrow-down:sy'></Icon>
                </div>
            </Tip>
            {/* <Tip id={LangID.textToolMention}>
                        <div className='shy-tool-text-menu-item'>
                            <Icon icon={Mention}></Icon>
                        </div>
                    </Tip> */}
        </div>}
        </div>;
    }
    onExcute(command: TextCommand) {
        var font: Record<string, any> = {};
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
        }
        this.emit('setStyle', { [BlockCssName.font]: font } as any);
        this.forceUpdate();
    }
    async onOpenFontColor(event: React.MouseEvent) {
        event.stopPropagation();
        this.blocked = true;
        var fontColor = await useColorSelector({ roundArea: Rect.fromEvent(event) });
        this.blocked = false;
        if (fontColor) {
            var font: Record<string, any> = {};
            if (fontColor.color) {
                this.textStyle.color = fontColor.color;
                font.color = fontColor.color;
                this.emit('setStyle', { [BlockCssName.font]: font } as any);
            }
            else if (fontColor.backgroundColor) {
                font.color = fontColor.backgroundColor;
                font.mode = 'color';
                this.textStyle.fill = { mode: 'color', color: fontColor.backgroundColor }
                this.emit('setStyle', { [BlockCssName.fill]: this.textStyle.fill } as any);
            }
        }
    }
    async onOpenLink(event: React.MouseEvent) {
        var pageLink = await useLinkPicker({ roundArea: Rect.fromEvent(event) });
        if (pageLink) {

        }
    }
    onOpenComment(event: React.MouseEvent) {

    }
    componentDidMount() {
        document.addEventListener('mousedown', this.onGlobalMousedown);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onGlobalMousedown);
    }
    async onOpenBlockSelector(event: React.MouseEvent) {
        event.stopPropagation();
        var block = this.block;
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
    private blocked: boolean = false;
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
    emit(name: 'turn', item: MenuItemType<BlockDirective>, event: MouseEvent);
    emit(name: 'close');
    only(name: 'setProp', props: Record<string, any>);
    only(name: 'setStyle', fn: (syles: Record<BlockCssName, Record<string, any>>) => void);
    only(name: 'turn', fn: (item: MenuItemType<BlockDirective>, event: MouseEvent) => void);
    only(name: 'close', fn: () => void);
}
export type textToolResult = { command: 'setStyle', styles: Record<BlockCssName, Record<string, any>> }
    | { command: 'turn', item: MenuItemType<BlockDirective>, event: MouseEvent }
    | { command: "setProp", props: Record<string, any> }
    | false;

export async function useTextTool(point: Point, options: { style: TextToolStyle, block: Block }) {
    var textTool = await Singleton(TextTool);
    textTool.open(point, options);
    return new Promise((resolve: (result: textToolResult) => void, reject) => {
        textTool.only('setStyle', (styles) => {
            resolve({ command: 'setStyle', styles })
        });
        textTool.only('setProp', (props) => {
            resolve({ command: 'setProp', props })
        })
        textTool.only("turn", (item, event) => {
            resolve({ command: 'turn', item, event })
        });
        textTool.only("close", () => {
            resolve(false);
        })
    })
}