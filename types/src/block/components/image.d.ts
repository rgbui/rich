/// <reference types="react" />
import { BaseComponent } from "../base/component";
import { Content } from "../base/common/content";
import { BlockAppear } from "../base/enum";
export declare class Image extends Content {
    src: string;
    appear: BlockAppear;
}
export declare class ImageView extends BaseComponent<Image> {
    render(): JSX.Element;
}
