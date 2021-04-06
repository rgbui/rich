/// <reference types="react" />
import { BaseComponent } from "../../base/component";
import "../../../../node_modules/prismjs/themes/prism.css";
import { Block } from "../../base";
import { BlockAppear, BlockDisplay } from "../../base/enum";
/**
 * prism url : https://prismjs.com/#examples
 * prism babel plug :https://www.npmjs.com/package/babel-plugin-prismjs
 *
 */
export declare class TextCode extends Block {
    appear: BlockAppear;
    display: BlockDisplay;
    code: string;
    language: string;
    get htmlContent(): {
        __html: any;
    };
}
export declare class TextCodeView extends BaseComponent<TextCode> {
    render(): JSX.Element;
}
