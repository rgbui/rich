import { Component } from "react";
import { PageLayout } from "./index";
import React from 'react';
import ReactDOM from 'react-dom';
export class PageLayoutView extends Component<{ pageLayout: PageLayout }>{
    constructor(props) {
        super(props);
    }
    get pageLayout() {
        return this.props.pageLayout;
    }
    render() {
        return <div className='sy-page-layout' style={{ marginLeft: 50, marginRight: 50 }}>{this.props.children}</div>
    }
}