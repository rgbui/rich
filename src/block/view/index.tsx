import React from "react";
import { Component, ErrorInfo } from "react";
import ReactDOM from 'react-dom';
import { Block } from "..";
import { S } from "../../../i18n/view";
import { RefreshSvg, TrashSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { Tip } from "../../../component/view/tooltip/tip";
import { util } from "../../../util/util";
import { Spin } from "../../../component/view/spin";

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
    errorRefreshTip: Tip;
    viewError: { error: Error, errorInfo: ErrorInfo } = null
    errorLoading: boolean = false;
    renderViewError() {
        if (this.viewError) {
            return <div className="sy-block-error border-red  bg-error round" style={this.block.visibleStyle}>
                <div className="f-14 remark flex" style={this.block.contentStyle}>
                    {this.errorLoading && <Spin></Spin>}
                    {!this.errorLoading && <><span className="gap-l-20 error"><S>显示出错了</S></span><Tip text='刷新' ref={e => this.errorRefreshTip = e}><span className="cursor link-red size-20" onMouseDown={async e => {
                        if (this.errorRefreshTip) this.errorRefreshTip.close()
                        this.errorLoading = true;
                        this.forceUpdate()
                        await util.delay(200);
                        this.errorLoading = false;
                        this.forceUpdate()
                    }}><Icon size={16} icon={RefreshSvg}></Icon></span></Tip><Tip text='删除当前块'><span className="cursor link-red size-20" onMouseDown={e => { e.stopPropagation(); this.block.onDelete() }}><Icon size={16} icon={TrashSvg}></Icon></span></Tip></>}
                </div>
            </div>
        }
    }
    
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