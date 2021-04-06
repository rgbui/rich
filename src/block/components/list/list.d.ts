/// <reference types="react" />
import { Block } from "../../base";
import "./style.less";
import { BaseComponent } from "../../base/component";
import { BlockAppear, BlockDisplay } from "../../base/enum";
export declare enum ListType {
    circle = 0,
    number = 1,
    arrow = 2
}
export declare class List extends Block {
    blocks: {
        childs: Block[];
        subChilds: Block[];
    };
    listType: ListType;
    expand: boolean;
    display: BlockDisplay;
    appear: BlockAppear;
}
export declare class ListView extends BaseComponent<List> {
    renderListType(): JSX.Element;
    render(): JSX.Element;
}
