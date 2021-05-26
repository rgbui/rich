import React from "react";
import { SyExtensionsComponent } from "../sy.component";
import { BlockMenuItem } from "./out.declare";
export declare class BlockMenu extends SyExtensionsComponent {
    private node;
    constructor(props: any);
    open(event: MouseEvent): void;
    close(): void;
    private mousedown;
    get isVisible(): boolean;
    get items(): BlockMenuItem[];
    private visible;
    private point;
    renderItem(item: BlockMenuItem, index: number): JSX.Element;
    render(): React.ReactPortal;
    componentWillUnmount(): void;
}
export interface BlockMenu {
    on(name: 'error', fn: (error: Error) => void): any;
    emit(name: 'error', error: Error): any;
    only(name: 'select', fn: (item: BlockMenuItem, event: MouseEvent) => void): any;
    emit(name: 'select', item: BlockMenuItem, event: MouseEvent): any;
}
