import { BaseComponent } from "../../../src/block/component";
import { prop, url, view } from "../../../src/block/factory/observable";
import React from 'react';
import Prism from 'prismjs';
import "../../../../node_modules/prismjs/themes/prism.css";
import { TextArea } from "../../../src/block/base/appear";
import { Block } from "../../../src/block";
import { BlockAppear, BlockDisplay } from "../../../src/block/base/enum";
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
    code: string = '';
    @prop()
    language: string = 'javascript';
    get htmlContent() {
        const html = Prism.highlight(this.code, Prism.languages[this.language], this.language);
        return html;
    }
}
@view('/code')
export class TextCodeView extends BaseComponent<TextCode>{
    render() {
        return <div className='sy-block-code' >
            <TextArea html={this.block.htmlContent}></TextArea>
        </div>
    }
}