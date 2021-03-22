import { Component } from "react";

import React from "react";



import ReactDOM from 'react-dom';
import { Block } from ".";
export abstract class BaseComponent<T extends Block> extends Component<{ block: T }> {
    constructor(props) {
        super(props);
    }
    componentWillMount() {
        this.block.view = this;
        this.willMount();
    }
    componentDidMount() {
        this.block.el = ReactDOM.findDOMNode(this) as HTMLDivElement;
        if (this.block.el) {
            (this.block.el as any).block = this.block;
            this.block.el.style.lineHeight = 'inherit';
            this.block.el.setAttribute('data-block', 'true');
        }
        this.didMount()
    }
    willMount() {

    }
    didMount() {

    }
    get block(): T {
        return this.props.block;
    }
}