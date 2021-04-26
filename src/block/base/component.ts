import { Component } from "react";
import React from "react";
import ReactDOM from 'react-dom';
import { Block } from "..";
export abstract class BaseComponent<T extends Block> extends Component<{ block: T }> {
    constructor(props) {
        super(props);
        this.block.view = this;
    }
    componentDidMount() {
        this.block.el = ReactDOM.findDOMNode(this) as HTMLDivElement;
        if (this.block.el) {
            (this.block.el as any).block = this.block;
            //this.block.el.style.lineHeight = 'inherit';
        }
        this.didMount();
        try {
            this.block.emit('mounted');
        }
        catch (ex) {
            this.block.page.onError(ex);
        }
    }
    didMount() {

    }
    componentWillUnmount() {
        if (typeof this.willUnmount == 'function') {
            this.willUnmount();
        }
    }
    willUnmount() {

    }
    get block(): T {
        return this.props.block;
    }
}