import { BaseComponent } from "../base/component";
import { Content } from "../base/common/content";
import katex from 'katex';

import React from 'react';
import { prop, url, view } from "../factory/observable";



@url('/katex')
export class Katex extends Content {
    @prop()
    formula: string = '';
    get htmlContent() {
        let html = katex.renderToString(this.formula, {
            throwOnError: false
        });
        return { __html: html }
    }
}
@view('/katex')
export class KatexView extends BaseComponent<Katex>{
    render() {
        return <div className='sy-block-katex' dangerouslySetInnerHTML={this.block.htmlContent}></div>
    }
}