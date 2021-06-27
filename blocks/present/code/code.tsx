import { BlockView } from "../../../src/block/view";
import { prop, url, view } from "../../../src/block/factory/observable";
import React from 'react';
import Prism from 'prismjs';
import "../../../node_modules/prismjs/themes/prism.css";
import { TextArea } from "../../../src/block/partial/appear";
import { Block } from "../../../src/block";
import { BlockAppear, BlockDisplay } from "../../../src/block/partial/enum";
/**
 * prism url : https://prismjs.com/#examples
 * prism babel plug :https://www.npmjs.com/package/babel-plugin-prismjs
 * 
 */
@url('/code')
export class TextCode extends Block {
    appear = BlockAppear.text;
    display = BlockDisplay.block;
    @prop()
    language: string = 'javascript';
    get htmlContent() {
        const html = Prism.highlight(this.textContent, Prism.languages[this.language], this.language);
        return html;
    }
}
@view('/code')
export class TextCodeView extends BlockView<TextCode>{
    render() {
        return <div className='sy-block-code' >
            <TextArea html={this.block.htmlContent}></TextArea>
        </div>
    }
}