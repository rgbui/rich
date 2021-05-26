import React from "react";
import { Point } from "../../common/point";
import { SyExtensionsComponent } from "../sy.component";
export declare class ReferenceSelector extends SyExtensionsComponent {
    private node;
    constructor(props: any);
    renderSelectors(): JSX.Element[];
    render(): React.ReactPortal;
    private visible;
    private pos;
    private command;
    private selectIndex;
    get isVisible(): boolean;
    open(point: Point): void;
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
}
export interface ReferenceSelector {
    on(name: 'error', fn: (error: Error) => void): any;
    emit(name: 'error', error: Error): any;
}
