import { Component } from "react";
import { PageLayout } from "./index";
import React from 'react';
import ReactDOM from 'react-dom';
export class PageLayoutView extends Component<{ pageLayout: PageLayout }>{
    constructor(props) {
        super(props);
    }
    render() {
        return <div className='sy-page-layout'>{this.props.children}</div>
    }
}