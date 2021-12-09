import { BlockView } from "../../../src/block/view";
import { prop, url, view } from "../../../src/block/factory/observable";
import React from 'react';
import Prism from 'prismjs';
import "../../../node_modules/prismjs/themes/prism.css";
import { TextArea } from "../../../src/block/view/appear";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import ChevronDown from "../../../src/assert/svg/chevronDown.svg";
import "./style.less";
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
        const html = Prism.highlight(this.content, Prism.languages[this.language], this.language);
        return html;
    }
    get isSupportTextStyle() {
        return false;
    }
    get isEnterInputNewLine() {
        return false;
    }
}
@view('/code')
export class TextCodeView extends BlockView<TextCode>{
    render() {
        return <div className='sy-block-code' >
            <div className='sy-block-code-head'>
                <div className='sy-block-code-head-lang'>
                    <span>{this.block.language}</span><ChevronDown></ChevronDown>
                </div>
            </div>
            <div className='sy-block-code-content'>
                <TextArea rf={e => this.block.elementAppear({ el: e })} placeholder={'键入代码'} html={this.block.htmlContent}></TextArea>
            </div>
        </div>
    }
}