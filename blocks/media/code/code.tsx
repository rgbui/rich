import { BlockView } from "../../../src/block/view";
import { prop, url, view } from "../../../src/block/factory/observable";
import React, { CSSProperties } from 'react';
import { Block } from "../../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { Point, Rect } from "../../../src/common/vector/point";
import { ChevronDownSvg, DotsSvg, DuplicateSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import "../../../src/assert/codemirror/lib/codemirror.css"
import lodash from "lodash";
import "./style.less";
import { CodeMirrorModes, loadCodeMirror, getCodeMirrorModes } from "./lang";
import { channel } from "../../../net/channel";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { ToolTip } from "../../../component/view/tooltip";
import { ShyAlert } from "../../../component/lib/alert";
import { CopyText } from "../../../component/copy";
import { lst } from "../../../i18n/store";
import { useFilterInput } from "../../../component/view/input/filter";
const CODEMIRROR_MODE = 'CODE_MIRROR_MODE';

/**
 * 
 * codemirror url: https://codemirror.net/5/doc/manual.html#config
 */
@url('/code')
export class TextCode extends Block {
    display = BlockDisplay.block;
    @prop()
    language: string = 'javascript';
    get isSupportTextStyle() {
        return false;
    }
    @prop()
    fixedWidth: number = 300;
    @prop()
    fixedHeight: number = 60;
    get isEnterCreateNewLine() {
        return false;
    }
    async initialLoad() {
        var lang = await channel.query('/cache/get', { key: CODEMIRROR_MODE });
        if (lang) this.language = lang;
    }
    async didMounted() {
        await this.renderCode();
    }
    @prop()
    lineNumbers: boolean = false;
    @prop()
    lineWrapping: boolean = true;
    codeMirror: any;
    async renderCode() {
        var CodeMirror = await loadCodeMirror();
        var codeMode = getCodeMirrorModes().find(g => g.mode && g.mode == this.language || Array.isArray(g.modes) && g.modes.includes(this.language));
        if (codeMode) await codeMode.load();
        this.codeMirror = CodeMirror(this.el.querySelector('.sy-block-code-content'), {
            lineNumbers: this.lineNumbers,
            lineWrapping: this.lineWrapping,
            value: this.content,
            mode: this.language,
            matchBrackets: true,  //括号匹配
            autoCloseBrackets: true,
            readOnly: this.isCanEdit() ? false : true
        });
        var save = lodash.debounce(() => {
            var value = this.codeMirror.getValue();
            this.onUpdateProps({ content: value });
        }, 1000);
        this.codeMirror.on('change', function () {
            save();
        })
    }
    async getPlain(this: Block) {
        return this.content;
    }
    onFocusCursor() {
        console.log('cm', this.codeMirror);
        if (this.codeMirror) this.codeMirror.focus();
    }
    async onChangeMode(name: string) {
        await this.page.onAction('onChangeMode', async () => {
            await this.updateProps({ language: name }, BlockRenderRange.self);
            if (this.codeMirror) {
                var codeMode = getCodeMirrorModes().find(g => g.mode && g.mode == this.language || Array.isArray(g.modes) && g.modes.includes(this.language));
                if (codeMode) await codeMode.load();
                this.codeMirror.setOption('mode', this.language);
                channel.act('/cache/set', { key: CODEMIRROR_MODE, value: this.language })
            }
        })
    }
    renderValue() {
        if (this.codeMirror) {
            this.codeMirror.setValue(this.content);
        }
    }
    async getMd() {
        return `\`\`\`${this.language}\n${this.content}\n\`\`\``
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        lodash.remove(rs, g => g.name == 'text-align');
        var at = rs.findIndex(g => g.name == BlockDirective.comment);
        var ns: MenuItem<string | BlockDirective>[] = [];
        ns.push({ name: 'lineNumbers', type: MenuItemType.switch, text: lst('行号'), checked: this.lineNumbers, icon: { name: 'bytedance-icon', code: 'list-numbers' } });
        ns.push({ name: 'lineWrapping', type: MenuItemType.switch, text: lst('自动换号'), checked: this.lineWrapping, icon: { name: 'bytedance-icon', code: 'corner-down-left' } });
        rs.splice(at - 1, 0, ...ns)
        lodash.remove(rs, g => g.name == 'color')
        var dat = rs.findIndex(g => g.name == BlockDirective.delete);
        rs.splice(dat + 1, 0,
            { type: MenuItemType.divide },
            {
                type: MenuItemType.help,
                text: lst('了解如何使用代码块'),
                url: window.shyConfig.isUS ? "https://help.shy.live/page/262#4bAJobT4wGWjPg2aLtQti7" : "https://help.shy.live/page/262#4bAJobT4wGWjPg2aLtQti7"
            }
        )
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent): Promise<void> {
        return await super.onClickContextMenu(item, event);
    }
    async onContextMenuInput(item: MenuItem<string | BlockDirective>): Promise<void> {
        if (item.name == 'lineNumbers' || item.name == 'lineWrapping') {
            await this.page.onAction('updateProps', async () => {
                await this.updateProps({ [item.name]: item.checked }, BlockRenderRange.self);
                if (this.codeMirror) {
                    this.codeMirror.setOption(item.name, item.checked)
                }
            })
            return
        }
        return await super.onContextMenuInput(item)
    }
    getVisibleHandleCursorPoint(): Point {
        if (!this.el) return;
        var r = Rect.fromEle(this.el);
        return r.leftTop.move(0, 22);
    }
    get fixedSize() {
        var el = this.el;
        if (!el) return {
            width: this.fixedWidth,
            height: this.fixedHeight
        }
        else {
            var e = el.querySelector('.sy-block-code-content') as HTMLElement;
            var r = Rect.fromEle(e);
            return {
                width: this.fixedWidth,
                height: Math.max(r.height + 20, this.fixedHeight)
            }
        }
    }
}

@view('/code')
export class TextCodeView extends BlockView<TextCode> {
    async changeLang(e: React.MouseEvent) {
        var menuItem = await useFilterInput({
            roundArea: Rect.fromEle(e.currentTarget as HTMLElement)
        }, {
            options: [
                { text: lst('纯文本'), words: [], name: 'plain', value: 'plain' },
                ...CodeMirrorModes.filter(g => g.abled).map(l => {
                    return {
                        text: l.label,
                        name: l.mode,
                        words: l.words ? l.words : [],
                        // visible: vfx as any,
                        checkLabel: this.block.language == l.mode
                    }
                })
            ],
            placeholder: lst('搜索语言...')
        })
        if (menuItem) {
            try {
                await this.block.onChangeMode(menuItem.name);
            }
            catch (ex) {
                console.log(ex);
                this.block.page.onError(ex);
            }
        }
    }
    async onCopy() {
        CopyText(this.block.content)
        ShyAlert(lst('复制成功'))
    }
    renderView() {
        var label = CodeMirrorModes.filter(g => g.abled).find(g => g.mode == this.block.language)?.label || '纯文本';
        var s: CSSProperties = {
            '--code-mirror-font-size': this.block.page.fontSize,
            '--code-mirror-line-height': this.block.page.lineHeight
        } as any;
        var contentStyle = this.block.contentStyle;
        if (this.block.isFreeBlock) {
            contentStyle.width = this.block.fixedWidth + 'px';
            contentStyle.minHeight = this.block.fixedHeight + 'px';
            return <div
                style={this.block.visibleStyle}>
                <div className='sy-block-code'
                    style={contentStyle}>
                    <div className={'sy-block-code-box border-light w100  border-box'}
                        style={{
                            margin: '0px',
                            padding: '8px',
                            minHeight: contentStyle.minHeight
                        }}
                    >
                        <div onMouseDown={e => {
                            e.stopPropagation();
                            if (!this.block.page.kit.picker.blocks.some(s => s == this.block)) {
                                this.block.page.kit.picker.onPicker([this.block])
                            }
                        }} className="sy-block-code-content "
                            style={{
                                width: 'calc(100% - 20px)',
                                minHeight: 30,
                                // height: 'calc(100% - 20px)',
                                ...s
                            }}
                        >
                        </div>
                    </div>
                </div>
                {this.renderComment()}
            </div>
        }
        return <div style={this.block.visibleStyle}>
            <div style={contentStyle}>
                <div className='sy-block-code' >
                    <div style={{
                        ...s
                    }} className={'sy-block-code-box ' + (this.block.isFreeBlock ? "border-light" : "")} >
                        <div className='sy-block-code-head'>
                            {this.props.block.isCanEdit() && <div className='sy-block-code-head-lang' onMouseDown={e => e.stopPropagation()} onMouseUp={e => this.changeLang(e)}>
                                <span>{label}</span>
                                <Icon size={14} icon={ChevronDownSvg}></Icon>
                            </div>}
                            <ToolTip overlay={lst('复制')}><div onMouseDown={e => { e.stopPropagation(); this.onCopy() }} className="size-24 flex-center cursor item-hover round">
                                <Icon size={16} icon={DuplicateSvg}></Icon>
                            </div></ToolTip>
                            {this.props.block.isCanEdit() && <ToolTip overlay={lst('菜单')}><div onMouseDown={e => {
                                e.stopPropagation();
                                this.block.onContextmenu(e.nativeEvent);
                            }} className="size-24 flex-center cursor item-hover round">
                                <Icon size={18} icon={DotsSvg}></Icon>
                            </div></ToolTip>}
                        </div>
                        <div
                            onMouseDown={e => e.stopPropagation()}
                            className={'sy-block-code-content ' + (this.block.lineNumbers ? "padding-h-10" : "padding-10")}>
                        </div>
                    </div>
                </div>
            </div>
            {this.renderComment()}
        </div>
    }
}