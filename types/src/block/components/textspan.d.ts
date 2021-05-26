/// <reference types="react" />
import { Content } from "../base/common/content";
import { BaseComponent } from "../base/component";
import { BlockAppear, BlockDisplay } from "../base/enum";
export declare class TextSpan extends Content {
    display: BlockDisplay;
    appear: BlockAppear;
    content: string;
    get isText(): boolean;
    get isSolid(): boolean;
    get isLayout(): boolean;
}
export declare class TextSpanView extends BaseComponent<TextSpan> {
    render(): JSX.Element;
}
