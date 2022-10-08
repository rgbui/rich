import React from "react";
import { Component, ErrorInfo } from "react";
import ReactDOM from 'react-dom';
import { Block } from "..";
export abstract class BlockView<T extends Block> extends Component<{ block: T }> {
    constructor(props) {
        super(props);
        this.block.view = this;
    }
    renderViewError() {
        if (this.isViewError) {
            return <div className="sy-block-error" style={this.block.visibleStyle}>块显示出错<span onMouseDown={e => { e.stopPropagation(); this.block.onDelete() }}>删除</span></div>
        }
    }
    isViewError: boolean = false;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.block.page.onError(error);
        this.isViewError = true;
        this.forceUpdate();
    }
    UNSAFE_componentWillMount(): void {
        this.block.isMounted = true;
    }
    componentDidUpdate(prevProps: Readonly<{ block: T; }>, prevState: Readonly<{}>, snapshot?: any): void {
        this.block.el = ReactDOM.findDOMNode(this) as HTMLDivElement;
    }
    componentDidMount() {
        this.block.isMounted = true;
        this.block.el = ReactDOM.findDOMNode(this) as HTMLDivElement;
        if (this.block.el) {
            (this.block.el as any).block = this.block;
        }
        this.didMount();
        try {
            this.block.onMounted()
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
        this.block.isMounted = false;
    }
    willUnmount() {
        try {
            this.block.onUnmount()
        } catch (ex) {
            this.block.page.onError(ex);
        }
    }
    get block(): T {
        return this.props.block;
    }
}