import React from "react";
import { SyExtensionsComponent } from "../sy.component";
export declare type EmojiType = {
    char: string;
    name: string;
    category: string;
    keywords: string[];
};
export declare class EmojiPicker extends SyExtensionsComponent {
    constructor(props: any);
    private node;
    get isVisible(): boolean;
    open(event: MouseEvent): void;
    close(): void;
    private visible;
    private point;
    private emojis;
    render(): React.ReactPortal;
    renderEmoji(): JSX.Element | JSX.Element[];
    private dragger;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private isLoaded;
    private loading;
    load(): Promise<void>;
    private onPick;
}
export interface EmojiPicker {
    on(name: 'pick', fn: (data: EmojiType) => void): any;
    emit(name: 'pick', data: EmojiType): any;
}
