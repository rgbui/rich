import React from 'react';
import { Anchor } from '../selection/anchor';
import { SelectorView } from './render';
export declare class TextInput extends React.Component<{
    selectorView: SelectorView;
}> {
    constructor(props: any);
    get selectorView(): SelectorView;
    get selector(): import("..").Selector;
    get blockSelector(): import("../../extensions/block").BlockSelector;
    textarea: HTMLTextAreaElement;
    onPaster(event: ClipboardEvent): Promise<void>;
    private isKeydown;
    onKeydown(event: KeyboardEvent): void | Promise<void>;
    onKeyup(event: KeyboardEvent): void;
    private deleteInputText;
    onInputDeleteText(): Promise<void>;
    onFocus(): void;
    private inputTextNode;
    private inputTextAt;
    onStartInput(anchor: Anchor): void;
    render(): JSX.Element;
    followAnchor(anchor: Anchor): void;
}
