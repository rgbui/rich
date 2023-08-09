import React from "react";
import { Component, ErrorInfo } from "react";
import ReactDOM from 'react-dom';
import { Block } from "..";
import { S } from "../../../i18n/view";
export abstract class BlockView<T extends Block> extends Component<{ block: T }> {
    constructor(props) {
        super(props);
        this.block.view = this;
    }
    render(): React.ReactNode {
        if (this.viewError) {
            return this.renderViewError();
        }
        return this.renderView();
    }
    abstract renderView(): React.ReactNode
    renderViewError() {
        if (this.viewError) {
            return <div className="sy-block-error" style={this.block.visibleStyle}><S>块显示出错</S><span onMouseDown={e => { e.stopPropagation(); this.block.onDelete() }}><S>删除</S></span></div>
        }
    }
    viewError: { error: Error, errorInfo: ErrorInfo } = null
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.viewError = { error, errorInfo };
        this.block.page.onError(error);
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