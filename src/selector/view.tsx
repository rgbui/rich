import { Component } from "react";
import { Selector } from ".";
import React from 'react';
import ReactDOM from 'react-dom';

import { TextInput } from "./input";
import { Bar } from "./handle/bar";
export class SelectorView extends Component<{ selector: Selector }>{
    constructor(props) {
        super(props);
        this.props.selector.view = this;
    }
    get selector() {
        return this.props.selector;
    }
    el: HTMLDivElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLDivElement;
    }
    textInput: TextInput;
    bar: Bar;
    render() {
        return <div className='sy-selector'>
            <TextInput ref={e => this.textInput = e} selector={this.selector}></TextInput>
            <Bar ref={e => this.bar = e} selector={this.selector}></Bar>
        </div>
    }
}