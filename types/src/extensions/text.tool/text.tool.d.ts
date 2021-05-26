import React from "react";
import { TextCommand } from "./text.command";
import { SyExtensionsComponent } from "../sy.component";
export declare class TextTool extends SyExtensionsComponent {
    private node;
    constructor(props: any);
    open(event: MouseEvent): void;
    close(): void;
    get isVisible(): boolean;
    private visible;
    private point;
    render(): React.ReactPortal;
    private dragger;
    componentDidMount(): void;
    componentWillUnmount(): void;
    get isDown(): boolean;
    onExcute(command: TextCommand): void;
    onOpenFontColor(): void;
    onOpenLink(): void;
    onOpenComment(): void;
    onOpenBlockSelector(): void;
}
export interface TextTool {
    on(name: 'selectionExcuteCommand', fn: (command: TextCommand) => void): any;
    emit(name: 'selectionExcuteCommand', command: TextCommand): any;
    on(name: 'error', fn: (error: Error) => void): any;
    emit(name: 'error', error: Error): any;
}
