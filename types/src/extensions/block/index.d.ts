import React from "react";
import { Point } from "../../common/point";
import { SyExtensionsComponent } from "../sy.component";
export declare class BlockSelector extends SyExtensionsComponent {
    private node;
    constructor(props: any);
    get filterSelectorData(): {
        childs: {
            text: string;
            pic: JSX.Element;
            url: string;
            description: string;
            label: string;
            labels: any[];
        }[];
        text: string;
    }[];
    get filterBlocks(): any[];
    get isSelectIndex(): boolean;
    renderSelectors(): JSX.Element[];
    render(): React.ReactPortal;
    onSelect(block?: any): void;
    private visible;
    private pos;
    private command;
    private selectIndex;
    get isVisible(): boolean;
    open(point: Point, text: string): void;
    onInputFilter(text: string): void;
    get selectBlockData(): any;
    close(): void;
    /**
     * 向上选择内容
     */
    keydown(): void;
    /**
     * 向下选择内容
     */
    keyup(): void;
    componentWillUnmount(): void;
    el: HTMLElement;
    componentDidMount(): void;
    componentDidUpdate(): void;
    interceptKey(event: KeyboardEvent): boolean;
}
export interface BlockSelector {
    on(name: 'error', fn: (error: Error) => void): any;
    emit(name: 'error', error: Error): any;
    only(name: 'select', fn: (item: Record<string, any>) => void): any;
    emit(name: 'select', item: Record<string, any>): any;
}
