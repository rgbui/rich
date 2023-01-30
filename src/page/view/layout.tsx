import React, { CSSProperties, ErrorInfo } from "react";
import { Page } from "..";
import { OnlineUsers } from "../../../extensions/at/users";
import { PageLayoutType } from "../declare";

export class PageLayoutView extends React.Component<{
    page: Page,
    children?: React.ReactNode
}>{
    render(): React.ReactNode {
        if (this.error) return this.renderErrorPage();
        var props = this.props;
        var type = props.page.pageLayout?.type;
        var mh = props.page.pageVisibleHeight ? (props.page.pageVisibleHeight + 'px') : '100%';
        if (type == PageLayoutType.doc || type == PageLayoutType.blog) {
            var style: CSSProperties = { minHeight: mh, width: '100%' };
            return <div className='shy-page-layout shy-page-layout-doc' style={style}>
                {props.children}
            </div>
        }
        else if (type == PageLayoutType.docCard) {
            var style: CSSProperties = { minHeight: mh, width: '100%' };
            return <div className='shy-page-layout shy-page-layout-doc-card' style={style}>
                {props.children}
            </div>
        }
        else if (type == PageLayoutType.db) {
            var style: CSSProperties = { minHeight: mh, width: '100%' };
            return <div className='shy-page-layout shy-page-layout-db' style={style}>
                {props.children}
            </div>
        }
        else if (type == PageLayoutType.dbForm) {
            var style: CSSProperties = { minHeight: mh, width: '100%' };
            return <div className={"shy-page-layout shy-page-layout-db-form"} style={style}>
                {/* {props.page.recordViewTemplate && <div className="bg flex-center round">
                    编辑模板<span>{props.page.schema.recordViews.find(c => c.id == props.page.recordViewId)?.text}</span>
                </div>} */}
                {props.children}
            </div>
        }
        else if (type == PageLayoutType.dbPickRecord) {
            var style: CSSProperties = { minHeight: mh, width: '100%' };
            return <div className={"shy-page-layout shy-page-layout-db-form"} style={style}>
                <div className='shy-page-layout-wrapper' >
                    {props.children}
                </div>
            </div>
        }
        else if (type == PageLayoutType.board) {
            var style: CSSProperties = { minHeight: mh, width: '100%' };
            Object.assign(style, props.page.matrix.getCss());
            return <div className={"shy-page-layout shy-page-layout-board"} style={{ width: '100%', height: mh }}>
                <div className='shy-page-layout-wrapper' style={style}>
                    {props.children}
                </div>
            </div>
        }
        else if (type == PageLayoutType.textChannel) {
            var style: CSSProperties = { minHeight: mh, width: '100%' };
            Object.assign(style, props.page.matrix.getCss());
            if (props.page.showMembers) {
                return <div className="flex flex-top" style={{ width: '100%', height: mh }}>
                    <div className="flex-auto white" style={style}>{props.children}</div>
                    <div className="flex-fix w-250" style={{ height: mh }}><OnlineUsers></OnlineUsers></div>
                </div>
            }
            else
                return <div className={"shy-page-layout shy-page-layout-text-channel"} style={{ width: '100%', height: mh }}>
                    <div className='shy-page-layout-wrapper' style={style}>
                        {props.children}
                    </div>
                </div>
        }
        else {
            return <div>没有定义版面</div>
        }
    }
    error: string = '';
    renderErrorPage() {
        if (this.error) {
            return <div>
                <div className="flex-center padding-40">
                    <span>页面出错了</span>
                </div>
                <div className="flex-center remark">
                    {this.error}
                </div>
            </div>
        }
    }
    componentDidCatch?(error: Error, errorInfo: ErrorInfo): void {
        this.error = error.message;
        this.forceUpdate();
    }
}



