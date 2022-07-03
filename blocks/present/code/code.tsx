import { BlockView } from "../../../src/block/view";
import { prop, url, view } from "../../../src/block/factory/observable";
import React from 'react';
import { Block } from "../../../src/block";
import { BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { useSelectMenuItem } from "../../../component/view/menu";
import { Rect } from "../../../src/common/vector/point";
import { ChevronDownSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import "../../../src/assert/codemirror/lib/codemirror.css"
import lodash from "lodash";
import "./style.less";
import { CodeMirrorModes, loadCodeMirror, getCodeMirrorModes } from "./lang";
/**
 * prism url : https://prismjs.com/#examples
 * prism babel plug :https://www.npmjs.com/package/babel-plugin-prismjs
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
    get isEnterCreateNewLine() {
        return false;
    }
    async didMounted() {
        await this.renderCode();
    }
    codeMirror: any;
    async renderCode() {
        var CodeMirror = await loadCodeMirror();
        var codeMode = getCodeMirrorModes().find(g => g.mode == this.language);
        if (codeMode) await codeMode.load();
        this.codeMirror = CodeMirror(this.el.querySelector('.sy-block-code-content'), {
            value: this.content,
            mode: this.language
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
        await this.onUpdateProps({ language: name }, { range: BlockRenderRange.self });
        if (this.codeMirror) {
            var codeMode = getCodeMirrorModes().find(g => g.mode == this.language);
            if (codeMode) await codeMode.load();
            this.codeMirror.setOption({
                mode: this.language
            })
        }
    }
}
@view('/code')
export class TextCodeView extends BlockView<TextCode>{
    async changeLang(e: React.MouseEvent) {
        var menuItem = await useSelectMenuItem({
            roundArea: Rect.fromEle(e.currentTarget as HTMLElement)
        },
            CodeMirrorModes.filter(g => g.abled).map(l => {
                return {
                    text: l.label,
                    name: l.mode,
                    checkLabel: this.block.language == l.mode
                }
            }));
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
    render() {
        var label = CodeMirrorModes.filter(g => g.abled).find(g => g.mode == this.block.language)?.label || 'unknow';
        return <div className='sy-block-code' onMouseDown={e => e.stopPropagation()}>
            <div className='sy-block-code-box' >
                <div className='sy-block-code-head'>
                    <div className='sy-block-code-head-lang' onMouseDown={e => e.stopPropagation()} onMouseUp={e => this.changeLang(e)}>
                        <span>{label}</span>
                        <Icon size={14} icon={ChevronDownSvg}></Icon>
                    </div>
                </div>
                <div className='sy-block-code-content'>
                </div>
            </div>
        </div>
    }
}