import { Component } from "react";
import { PageLayout } from "./index";
import React from 'react';
import ReactDOM from "react-dom";
export class PageLayoutView extends Component<{ pageLayout: PageLayout }>{
    constructor(props) {
        super(props);
    }
    el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
    }
    get pageLayout() {
        return this.props.pageLayout;
    }
    render() {
        return <div className='shy-page-layout' style={{ width: 900, paddingLeft: 100, paddingRight: 100, margin: '0 auto' }}>{this.props.children}</div>
    }
}