import { Component } from "react";
import { PageLayout } from "./index";
import React from 'react';
import ReactDOM from "react-dom";
import "./style.less";
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
        var isFullWidth: boolean = true;
        var mh = this.pageLayout.page.pageVisibleHeight + 'px' || '100%';
        return <div className='shy-page-layout' style={{
            paddingLeft: isFullWidth ? 100 : undefined,
            paddingRight: isFullWidth ? 100 : undefined,
            width: isFullWidth ? undefined : 900,
            //minHeight: this.pageLayout.page.pageVisibleHeight || '100%'
            // width: 900,
            // paddingLeft: 100,
            // paddingRight: 100,
            // margin: '100 auto'
        }}>
            <div className='shy-page-layout-wrapper' style={{ minHeight: `calc(${mh} - 40px)` }}>
                {this.props.children}
            </div>
        </div>
    }
}