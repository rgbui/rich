/// <reference types="react" />
import { ContentAreaComposition } from "./composition/content";
import { BaseComponent } from "../component";
import { BlockAppear } from "../enum";
export declare class View extends ContentAreaComposition {
    /**
     * 是否为内容视图
     */
    isRockView: boolean;
    appear: BlockAppear;
    get isArea(): boolean;
}
/*** 在一个页面上，从视觉上有多个视图块，
 * 如每个页面都有一个初始的内容视图，不可拖动
 *  但页面可以会有弹层等一些其它的视图
 */
export declare class ViewComponent extends BaseComponent<View> {
    render(): JSX.Element;
}
