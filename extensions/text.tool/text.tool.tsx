import React from "react";
import { createPortal } from "react-dom";
import { Point, Rect, RectUtility } from "../../src/common/point";
import { Icon } from "../../component/view/icon";
import Equation from "../../src/assert/svg/equation.svg";
import Mention from "../../src/assert/svg/mention.svg";
import { Dragger } from "../../src/common/dragger";
import { TextCommand } from "./text.command";
import { EventsComponent } from "../../component/events.component";
import { BlockCssName, FillCss } from "../../src/block/pattern/css";
import { LangID } from "../../i18n/declare";
import { Tip } from "../../component/view/tip";
import { useLinkPicker } from "../link/picker";
import { useColorSelector } from "../color";
import { Block } from "../../src/block";
import { useSelectMenuItem } from "../../component/view/menu";

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

export class TextTool extends EventsComponent {
    private node: HTMLElement;
    private textStyle: TextToolStyle = {} as any;
    constructor(props) {
        super(props);
        this.node = document.body.appendChild(document.createElement('div'));
    }
    private block: Block = null;
    open(point, block: Block) {
        this.point = this.point;
        this.visible = true;
        this.textStyle = this.emit('getTextStyle');
        this.block = block;
        this.forceUpdate(() => {
            var menu: HTMLElement = this.node.querySelector('.sy-tool-text-menu');
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
        }
    }
    get isVisible() {
        return this.visible;
    }
    private visible: boolean = false;
    private point: Point = new Point(0, 0);
    render() {
        var style: Record<string, any> = {};
        style.top = this.point.y;
        style.left = this.point.x;
        return createPortal(
            <div >
                {this.visible == true && <div className='sy-tool-text-menu' style={style}>
                    <Tip id={LangID.textToolTurn}>
                        <div className='sy-tool-text-menu-item sy-tool-text-menu-devide' onMouseDown={e => this.onOpenBlockSelector(e)}>
                            <span>Text</span><Icon icon='arrow-down:sy'></Icon>
                        </div>
                    </Tip>
                    <Tip id={LangID.textToolLink}>
                        <div className='sy-tool-text-menu-item sy-tool-text-menu-devide' onMouseDown={e => this.onOpenLink(e)}>
                            <Icon icon='link:sy'></Icon><Icon icon='arrow-down:sy'></Icon>
                        </div>
                    </Tip>
                    <Tip id={LangID.textToolComment}>
                        <div className='sy-tool-text-menu-item sy-tool-text-menu-devide' onMouseDown={e => this.onOpenComment(e)}>
                            <Icon icon='comment:sy'></Icon>
                        </div>
                    </Tip>
                    <Tip id={LangID.textToolBold}>
                        <div className={'sy-tool-text-menu-item' + (this.textStyle.bold == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.bold == true ? TextCommand.cancelBold : TextCommand.bold)}>
                            <Icon icon='bold:sy'></Icon>
                        </div>
                    </Tip>
                    <Tip id={LangID.textToolItailc}>
                        <div className={'sy-tool-text-menu-item' + (this.textStyle.italic == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.italic == true ? TextCommand.cancelItalic : TextCommand.italic)}>
                            <Icon icon='italic:sy'></Icon>
                        </div>
                    </Tip>
                    <Tip id={LangID.textToolUnderline}>
                        <div className={'sy-tool-text-menu-item' + (this.textStyle.underline == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.underline == true ? TextCommand.cancelLine : TextCommand.underline)}>
                            <Icon icon='underline:sy'></Icon>
                        </div>
                    </Tip>
                    <Tip id={LangID.textToolDeleteLine}>
                        <div className={'sy-tool-text-menu-item' + (this.textStyle.deleteLine == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.deleteLine == true ? TextCommand.underline : TextCommand.deleteLine)}>
                            <Icon icon='delete-line:sy'></Icon>
                        </div>
                    </Tip>
                    <Tip id={LangID.textToolCode}>
                        <div className={'sy-tool-text-menu-item' + (this.textStyle.code == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.code == true ? TextCommand.cancelCode : TextCommand.code)}>
                            <Icon icon='code:sy'></Icon>
                        </div>
                    </Tip>
                    <Tip id={LangID.textToolEquation}>
                        <div className={'sy-tool-text-menu-item' + (this.textStyle.equation == true ? " hover" : "")} onMouseDown={e => this.onExcute(this.textStyle.equation == true ? TextCommand.cancelEquation : TextCommand.equation)}>
                            <Icon icon={Equation}></Icon>
                        </div>
                    </Tip>
                    <Tip id={LangID.textToolColor}>
                        <div className='sy-tool-text-menu-item' onMouseDown={e => this.onOpenFontColor(e)}>
                            <span>A</span>
                            <Icon icon='arrow-down:sy'></Icon>
                        </div>
                    </Tip>
                    <Tip id={LangID.textToolMention}>
                        <div className='sy-tool-text-menu-item'>
                            <Icon icon={Mention}></Icon>
                        </div>
                    </Tip>
                </div>}
            </div>,
            this.node);
    }
    private dragger: Dragger;
    componentDidMount() {
        this.dragger = new Dragger(this.node);
        this.dragger.bind();
    }
    componentWillUnmount() {
        if (this.dragger) this.dragger.off()
        this.node.remove();
    }
    get isDown() {
        return this.dragger.isDown;
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
        }
        this.emit('setStyle', { [BlockCssName.font]: font } as any);
        this.forceUpdate();
    }
    async onOpenFontColor(event: React.MouseEvent) {
        var fontColor = await useColorSelector({ roundArea: Rect.fromEvent(event) });
        if (fontColor) {
            var font: Record<string, any> = {};
            if (fontColor.color) {
                this.textStyle.color = fontColor.color;
                font.color = fontColor.color;
                this.emit('setStyle', { [BlockCssName.font]: font } as any);
            }
            if (fontColor.backgroundColor) {
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
    async onOpenBlockSelector(event: React.MouseEvent) {
        var block = this.block;
        console.log(block, 'block');
        if (block.isLine) block = block.closest(x => !x.isLine);
        var re = await useSelectMenuItem(
            {
                roundArea: Rect.fromEvent(event),
                direction: 'left'
            },
            await block.onGetTurnMenus()
        );
        if (re) {
            await block.onClickContextMenu(re.item, re.event);
        }
    }
}
export interface TextTool {
    on(name: 'setStyle', fn: (styles: Record<BlockCssName, Record<string, any>>) => void);
    emit(name: 'setStyle', styles: Record<BlockCssName, Record<string, any>>);
    on(name: 'error', fn: (error: Error) => void);
    emit(name: 'error', error: Error);
    emit(name: 'getTextStyle'): TextToolStyle;
    on(name: 'getTextStyle', fn: () => TextToolStyle)
}