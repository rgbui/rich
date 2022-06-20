import { BlockView } from "../../../src/block/view";
import { prop, url, view } from "../../../src/block/factory/observable";
import React from 'react';
import Prism from 'prismjs';
import "../../../node_modules/prismjs/themes/prism.css";
import { TextArea } from "../../../src/block/view/appear";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import "./style.less";
import { useSelectMenuItem } from "../../../component/view/menu";
import { Rect } from "../../../src/common/vector/point";
import { loadPrismLang, PrismLangLabels } from "./lang";
import { AppearAnchor } from "../../../src/block/appear";
import { ChevronDownSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
/**
 * prism url : https://prismjs.com/#examples
 * prism babel plug :https://www.npmjs.com/package/babel-plugin-prismjs
 * 
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
    htmlCode = '';
    async didMounted() {
        await this.renderCode();
    }
    async renderCode() {
        var name = this.language.toLowerCase();
        try {
            await loadPrismLang(name);
            var html = Prism.highlight(this.content,
                Prism.languages[name],
                name
            );
            this.htmlCode = html;
            await this.forceUpdate();
        }
        catch (ex) {
            console.log(ex);
            console.log(name, this.content, Prism.languages[name]);
        }
    }
    private time;
    async changeAppear(appear: AppearAnchor) {
        if (this.time) {
            clearTimeout(this.time);
            this.time = null;
        }
        this.time = setTimeout(async () => {
            var sel = window.getSelection();
            if (sel.focusNode && appear.el.contains(sel.focusNode)) {
                var offset = appear.getCursorOffset(sel.focusNode, sel.focusOffset);
                await this.renderCode();
                appear.collapse(offset);
            }
        }, 2e3);
    }
}
@view('/code')
export class TextCodeView extends BlockView<TextCode>{
    async changeLang(e: React.MouseEvent) {
        var menuItem = await useSelectMenuItem({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) },
            PrismLangLabels.map(l => {
                return {
                    text: l.label,
                    name: l.language
                }
            }));
        if (menuItem) {
            try {
                var name = menuItem.item.name;
                await this.block.onUpdateProps({ language: name });
                await this.block.renderCode();
            }
            catch (ex) {
                console.log(ex);
                this.block.page.onError(ex);
            }
        }
    }
    render() {
        var label = PrismLangLabels.find(g => g.language == this.block.language)?.label || 'unknow';
        return <div className='sy-block-code'>
            <div className='sy-block-code-box' >
                <div className='sy-block-code-head'>
                    <div className='sy-block-code-head-lang' onMouseDown={e => e.stopPropagation()} onMouseUp={e => this.changeLang(e)}>
                        <span>{label}</span>
                        <Icon icon={ChevronDownSvg}></Icon>
                    </div>
                </div>
                <div className='sy-block-code-content'>
                    <TextArea
                        block={this.block}
                        prop='content'
                        placeholder={'键入代码'} isHtml
                        html={this.block.htmlCode}></TextArea>
                </div>
            </div></div>
    }
}