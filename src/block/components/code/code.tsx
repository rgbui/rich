import { BaseComponent } from "../../base/component";
import { Content } from "../../base/common/content";
import { url, view } from "../../factory/observable";
import React from 'react';
import Prism from 'prismjs';
import "../../../../node_modules/prismjs/themes/prism.css";
/**
 * prism url : https://prismjs.com/#examples
 * prism babel plug :https://www.npmjs.com/package/babel-plugin-prismjs
 * 
 */
@url('/code')
export class TextCode extends Content {


    code: string = '';
    language: string = 'javascript';
    get htmlContent() {
        const html = Prism.highlight(this.code, Prism.languages[this.language], this.language);
        return {
            __html: html
        }
    }
}
@view('/code')
export class TextCodeView extends BaseComponent<TextCode>{
    render() {
        return <div className='sy-block-code' dangerouslySetInnerHTML={this.block.htmlContent}></div>
    }
}