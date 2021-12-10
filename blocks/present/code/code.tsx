import { BlockView } from "../../../src/block/view";
import { prop, url, view } from "../../../src/block/factory/observable";
import React from 'react';
import Prism from 'prismjs';
import "../../../node_modules/prismjs/themes/prism.css";
import { TextArea } from "../../../src/block/view/appear";
import { Block } from "../../../src/block";
import { BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import ChevronDown from "../../../src/assert/svg/chevronDown.svg";
import "./style.less";
import { useSelectMenuItem } from "../../../component/view/menu";
import { Rect } from "../../../src/common/point";
import { loadPrismLang, PrismLangLabels } from "./lang";
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
    get htmlContent() {
        console.log(Object.keys(Prism.languages));
        const html = Prism.highlight(this.content,
            Prism.languages[this.language],
            this.language
        );
        return html;
    }
    get isSupportTextStyle() {
        return false;
    }
    get isEnterInputNewLine() {
        return false;
    }
    htmlCode = '';
    didMounted() {
        this.renderCode();
    }
    async renderCode() {
        this.htmlCode = Prism.highlight(this.content,
            Prism.languages[this.language],
            this.language
        );
        this.view.forceUpdate();
    }
}
@view('/code')
export class TextCodeView extends BlockView<TextCode>{
    async changeLang(e: React.MouseEvent) {
        var menuItem = await useSelectMenuItem({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) },
            PrismLangLabels.map(l => {
                return {
                    text: l,
                    name: l
                }
            }));
        if (menuItem) {
            var name = menuItem.item.name;
            await loadPrismLang(name);
            await this.block.onUpdateProps({ language: name }, BlockRenderRange.self);
            await this.block.renderCode();
        }
    }
    render() {
        return <div className='sy-block-code' >
            <div className='sy-block-code-head'>
                <div className='sy-block-code-head-lang' onMouseDown={e => e.stopPropagation()} onMouseUp={e => this.changeLang(e)}>
                    <span>{this.block.language}</span><ChevronDown></ChevronDown>
                </div>
            </div>
            <div className='sy-block-code-content'>
                <TextArea rf={e => this.block.elementAppear({ el: e, prop: 'content' })}
                    placeholder={'键入代码'}
                    html={this.block.htmlCode}></TextArea>
            </div>
        </div>
    }
}