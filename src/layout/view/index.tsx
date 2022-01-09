import { Component, CSSProperties } from "react";
import { PageLayout } from "../index";
import React from 'react';
import ReactDOM from "react-dom";
import { PageLayoutType } from "../declare";
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
        var mh = this.pageLayout.page.pageVisibleHeight ? (this.pageLayout.page.pageVisibleHeight + 'px') : '100%';
        if (this.pageLayout.type == PageLayoutType.doc) {
            var isFullWidth: boolean = true;
            return <div className='shy-page-layout shy-page-layout-doc' style={{
                paddingLeft: isFullWidth ? 100 : undefined,
                paddingRight: isFullWidth ? 100 : undefined,
                width: isFullWidth ? undefined : 900
            }}>
                <div className='shy-page-layout-wrapper' style={{ minHeight: `calc(${mh} - 40px)` }}>
                    {this.props.children}
                </div>
            </div>
        }
        else if (this.pageLayout.type == PageLayoutType.dbForm) {
            return <div className={"shy-page-layout shy-page-layout-db-form"}>
                <div className='shy-page-layout-wrapper' >
                    {this.props.children}
                </div>
            </div>
        }
        else if (this.pageLayout.type == PageLayoutType.board) {
            var style: CSSProperties = { minHeight: mh, width: '100%' };
            Object.assign(style, this.pageLayout.page.matrix.getCss());
            return <div className={"shy-page-layout shy-page-layout-board"} style={{ width: '100%', height: mh }}>
                <div className='shy-page-layout-wrapper' style={style}>
                    {this.props.children}
                </div>
            </div>
        }
        else {
            return <div>没有定义版面</div>
        }
    }
}