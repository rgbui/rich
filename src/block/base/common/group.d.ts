/// <reference types="react" />
import { BaseComponent } from "../component";
import { BlockAppear, BlockDisplay } from "../enum";
import { Block } from "..";
/**
 * 可以将相邻的block变成一个整体去操作，
 * 可以看成是contentBlock
 */
export declare class Group extends Block {
    display: BlockDisplay;
    appear: BlockAppear;
}
export declare class GroupView extends BaseComponent<Group> {
    render(): JSX.Element;
}
