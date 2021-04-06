import React from 'react';
import { Anchor } from '../anchor';
import { SelectorView } from './render';
export declare class TextInput extends React.Component<{
    selectorView: SelectorView;
}> {
    constructor(props: any);
    get selectorView(): SelectorView;
    get selector(): import("..").Selector;
    textarea: HTMLTextAreaElement;
    onPaster(event: ClipboardEvent): void;
    private isKeydown;
    onKeydown(event: KeyboardEvent): void;
    onKeyup(event: KeyboardEvent): void;
    onInputDeleteText(): void;
    onFocus(): void;
    private inputTextNode;
    private inputTextAt;
    onStartInput(anchor: Anchor): void;
    render(): JSX.Element;
    followAnchor(anchor: Anchor): void;
}
