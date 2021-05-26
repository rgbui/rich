/// <reference types="react" />
import { BaseComponent } from "../base/component";
import { BlockComposition } from "../base/common/composition/block";
import { BlockAppear, BlockDisplay } from "../base/enum";
/***
 * 文字型的block，
 * 注意该文字block里面含有子文字或其它的如图像block等
 */
export declare class TextContent extends BlockComposition {
    content: string;
    display: BlockDisplay;
    appear: BlockAppear;
    get isTextContent(): boolean;
}
export declare class TextContentView extends BaseComponent<TextContent> {
    render(): JSX.Element;
}
