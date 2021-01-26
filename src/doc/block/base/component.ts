import { Component } from "react";
import { BaseBlock } from "./base";
import React from "react";
import ReactDOM from 'react-dom';
export class BaseComponent<T extends BaseBlock> extends Component<{ block: T }> {
    componentWillMount() {
        this.block.view = this;
        this.willMount();
    }
    componentDidMount() {
        this.block.el = ReactDOM.findDOMNode(this) as HTMLDivElement;
        if (this.block.el) {
            (this.block.el as any).block = this.block;
            this.block.el.setAttribute('data-block', 'true');
        }
        this.didMount()
    }
    willMount() {

    }
    didMount() {

    }
    constructor(props) {
        super(props);
    }
    get block(): T {
        return this.props.block;
    }
}