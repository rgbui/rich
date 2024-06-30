import React from "react";
import { Component, ErrorInfo } from "react";
import ReactDOM from 'react-dom';
import { Block } from "..";
import { S } from "../../../i18n/view";
import { RefreshSvg, TrashSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { Tip } from "../../../component/view/tooltip/tip";
import { Rect } from "../../common/vector/point";
import { ToolTip } from "../../../component/view/tooltip";

export abstract class BlockView<T extends Block> extends Component<{ block: T }> {
    constructor(props) {
        super(props);
        this.block.view = this;
    }
    /**
     * 这里设置一个假的state，用来触发更新
     * 主要是block 里面的属性比较复杂，不好比较，这里是通过手动来触发更新
     */
    state: Readonly<{ seq: number }> = {
        seq: 0
    };
    // 🔥🍅🤴🏻🟦 shouldComponentUpdate()函数的使用 ★
    // 更新之前
    shouldComponentUpdate() {
        // 通过返回true或false，决定是否更新
        // 返回true 表示更新
        // 返回false 表示不更新
        if (this.block.needUpdate) {
            this.block.needUpdate = false;
            return true;
        }
        return false
    }
    render() {
        if (this.viewError) {
            return this.renderViewError();
        }
        return this.renderView();
    }
    abstract renderView(): React.ReactNode
    errorRefreshTip: Tip;
    viewError: { error: Error, errorInfo: ErrorInfo } = null
    renderViewError() {
        if (this.viewError) {
            return <div className="sy-block-error border-red  bg-error round" style={this.block.visibleStyle}>
                <div className="f-14 remark flex" style={this.block.contentStyle}>
                    <span className="gap-l-20 error"><S text="局部块出错了您可以删除它">局部出错了，您可以刷新或删除它</S></span><Tip text='刷新' ref={e => this.errorRefreshTip = e}><span className="gap-l-10 cursor link-red size-20 round item-hover flex-center" onMouseDown={async e => {
                        e.stopPropagation();
                        if (this.errorRefreshTip) this.errorRefreshTip.close()
                        this.viewError = null;
                        this.forceUpdate()
                    }}><Icon size={16} icon={RefreshSvg}></Icon></span></Tip><Tip text='删除当前块'><span className="gap-l-10 cursor link-red size-20 round item-hover flex-center" onMouseDown={e => { e.stopPropagation(); this.block.onDelete() }}><Icon size={16} icon={TrashSvg}></Icon></span></Tip>
                </div>
            </div>
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.viewError = { error, errorInfo };
        this.block.page.onError(error);
        this.forceUpdate();
    }
    componentDidUpdate(prevProps: Readonly<{ block: T; }>, prevState: Readonly<{}>, snapshot?: any): void {
        this.block.el = ReactDOM.findDOMNode(this) as HTMLDivElement;
        this.block.isMed = true;
    }
    componentDidMount() {
        this.block.isMed = true;
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
        this.block.isMed = false;
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
    renderComment() {
        if (this.block.commentCount > 0) {
            return <ToolTip overlay={<S>点击展开评论</S>}><div className="shy-block-comment-count flex-center h-20 min-w-20 f-12 cursor" onMouseDown={e => { this.block.onInputComment(Rect.fromEle(e.currentTarget as HTMLElement)) }}>
                {this.block.commentCount}
            </div></ToolTip>
        }
        return <></>
    }
}