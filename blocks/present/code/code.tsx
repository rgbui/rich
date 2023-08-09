import { BlockView } from "../../../src/block/view";
import { prop, url, view } from "../../../src/block/factory/observable";
import React from 'react';
import { Block } from "../../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { useSelectMenuItem } from "../../../component/view/menu";
import { Rect } from "../../../src/common/vector/point";
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
const CODEMIRROR_MODE = 'CODE_MIRROR_MODE';

/**
 * 
 * codemirror url: https://codemirror.net/5/doc/manual.html#config
 */
@url('/code')
export class TextCode extends Block {
    display = BlockDisplay.block;
    @prop()
    language: string = 'plain';
    get isSupportTextStyle() {
        return false;
    }
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
        var codeMode = getCodeMirrorModes().find(g => g.mode == this.language);
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
    async onChangeMode(name: string) {
        await this.page.onAction('onChangeMode', async () => {
            await this.updateProps({ language: name }, BlockRenderRange.self);
            if (this.codeMirror) {
                var codeMode = getCodeMirrorModes().find(g => g.mode == this.language);
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
        rs = rs.splice(2);
        lodash.remove(rs, g => g.name == 'text-align');
        var at = rs.findIndex(g => g.text == lst('颜色'));
        var ns: MenuItem<string | BlockDirective>[] = [];
        // ns.push({ type: MenuItemType.divide });
        ns.push({ name: 'lineNumbers', type: MenuItemType.switch, text:lst('行号') , checked: this.lineNumbers, icon: { name: 'bytedance-icon', code: 'list-numbers' } });
        ns.push({ name: 'lineWrapping', type: MenuItemType.switch, text: lst('自动换号'), checked: this.lineWrapping, icon: { name: 'bytedance-icon', code: 'corner-down-left' } });
        ns.push({ type: MenuItemType.divide });
        rs.splice(at, 0, ...ns)
        lodash.remove(rs, g => g.text ==lst('颜色') )
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
}
@view('/code')
export class TextCodeView extends BlockView<TextCode>{
    async changeLang(e: React.MouseEvent) {
        var vfx = (items: MenuItem[], currentItem: MenuItem) => {
            var item = items.find(g => g.name == 'search_word');
            if (item) {
                if (item.value) {
                    if ((currentItem.text as string).indexOf(item.value) == 0) {
                        return true;
                    }
                    return false;
                }
            }
            return true;
        }
        var menuItem = await useSelectMenuItem({
            roundArea: Rect.fromEle(e.currentTarget as HTMLElement)
        },
            [{
                type: MenuItemType.input,
                name: 'search_word',
                updateMenuPanel: true,
                value: '',
            },
            { type: MenuItemType.divide },
            {
                type: MenuItemType.container,
                containerHeight: 200,
                childs: [
                    { text: lst('纯文本'), name: 'plain', value: 'plain' },
                    ...CodeMirrorModes.filter(g => g.abled).map(l => {
                        return {
                            text: l.label,
                            name: l.mode,
                            visible: vfx as any,
                            checkLabel: this.block.language == l.mode
                        }
                    })
                ]
            }]
        );
        if (menuItem) {
            try {
                await this.block.onChangeMode(menuItem.item.name);
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
        var s = {
            '--code-mirror-font-size': this.block.page.fontSize + 'px',
            '--code-mirror-line-height': this.block.page.lineHeight + 'px'
        } as any
        return <div style={this.block.visibleStyle}><div
            className='sy-block-code'
            style={{
                ...s
            }}
            onMouseDown={e => e.stopPropagation()}>
            <div className='sy-block-code-box' >
                <div className='sy-block-code-head'>
                    {this.props.block.isCanEdit() && <div className='sy-block-code-head-lang' onMouseDown={e => e.stopPropagation()} onMouseUp={e => this.changeLang(e)}>
                        <span>{label}</span>
                        <Icon size={14} icon={ChevronDownSvg}></Icon>
                    </div>}
                    <ToolTip overlay={lst('复制')}><div onMouseDown={e => this.onCopy()} className="size-24 flex-center cursor item-hover round">
                        <Icon size={18} icon={DuplicateSvg}></Icon>
                    </div></ToolTip>
                    {this.props.block.isCanEdit() && <ToolTip overlay={lst('菜单')}><div onMouseDown={e => {
                        e.stopPropagation();
                        this.block.onContextmenu(e.nativeEvent);
                    }} className="size-24 flex-center cursor item-hover round">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </div></ToolTip>}
                </div>
                <div className={'sy-block-code-content ' + (this.block.lineNumbers ? "padding-h-10" : "padding-10")}>
                </div>
            </div>
        </div>
        </div>
    }
}