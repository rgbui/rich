import { Component } from "react";
import { Block } from ".";
export declare abstract class BaseComponent<T extends Block> extends Component<{
    block: T;
}> {
    constructor(props: any);
    componentWillMount(): void;
    componentDidMount(): void;
    willMount(): void;
    didMount(): void;
    get block(): T;
}
