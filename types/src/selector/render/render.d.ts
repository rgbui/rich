import { Component } from "react";
import { Selector } from "..";
import { TextInput } from "./textarea";
import { Bar } from "./bar";
export declare class SelectorView extends Component<{
    selector: Selector;
}> {
    constructor(props: any);
    get selector(): Selector;
    el: HTMLDivElement;
    componentDidMount(): void;
    textInput: TextInput;
    bar: Bar;
    render(): JSX.Element;
}
