/// <reference types="react" />
import { BaseComponent } from "../component";
import { BlockAppear, BlockDisplay } from "../enum";
import { Block } from '..';
/**
 * 分区中会有很多行，每行存在于一个或多个block
 */
export declare class Row extends Block {
    display: BlockDisplay;
    appear: BlockAppear;
    get isRow(): boolean;
}
export declare class RowView extends BaseComponent<Row> {
    onMousemove(event: MouseEvent): void;
    render(): JSX.Element;
}
