import { Component } from "react";
import { Selector } from "..";
import React from 'react';
import ReactDOM from 'react-dom';

import { Anchor } from "../anchor";

import { Icon } from "../../component/icon";
import Tooltip from "rc-tooltip";
import { TextInput } from "./textarea";
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
    render() {
        return <div className='sy-selector'>
            <TextInput ref={e => this.textInput = e} selectorView={this}></TextInput>
        </div>
    }
}