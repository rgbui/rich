import { Component } from "react";
import { Block } from "..";
export declare abstract class BaseComponent<T extends Block> extends Component<{
    block: T;
}> {
    constructor(props: any);
    componentDidMount(): void;
    didMount(): void;
    componentWillUnmount(): void;
    willUnmount(): void;
    get block(): T;
}
