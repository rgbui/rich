import { Component } from "react";
import React from 'react';
import ReactDOM from 'react-dom';
import { Page } from "./index";
import { PageLayoutView } from "./layout/render";
import { SelectorView } from "../selector/render";

export class PageView extends Component<{ page: Page }> {
    constructor(props) {
        super(props);
        this.page.viewRender = this;
    }
    get page() {
        return this.props.page;
    }
    render() {
        return <div className='kanhai-page-view' tabIndex={1} onKeyDown={this.page.onKeydown.bind(this.page)}><PageLayoutView pageLayout={this.page.pageLayout}>
            <SelectorView selector={this.page.selector}></SelectorView>
            <div className='kanhai-page-views' onMouseDown={this.page.onMousedown.bind(this.page)}>
                {this.page.views.map(x => {
                    return <x.viewComponent key={x.id} block={x} />
                })}
            </div>
        </PageLayoutView></div>
    }
}