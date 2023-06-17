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
        if (type == PageLayoutType.doc || type == PageLayoutType.recordView ) {
            var style: CSSProperties = { minHeight: mh, width: '100%' };
            return <div className='shy-page-layout shy-page-layout-doc' style={style}>
                {props.page.isSchemaRecordViewTemplate && <div className="pos-center-top t-20 w-200 h-30 bg flex-center round f-12">
                    编辑模板<span>[{props.page.schema.views.find(c => c.id == props.page.pe.id1)?.text}]</span>
                </div>}
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
        else if (type == PageLayoutType.formView) {
            var style: CSSProperties = { minHeight: mh, width: '100%' };
            return <div className={"shy-page-layout shy-page-layout-db-form"} style={style}>
                {props.page.isSchemaRecordViewTemplate && <div className="pos-center-top  t-20  w-200 h-30 bg flex-center round f-12">
                    编辑模板<span>[{props.page.schema.views.find(c => c.id == props.page.pe.id1)?.text}]</span>
                </div>}
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
            else  return <div className={"shy-page-layout shy-page-layout-text-channel"} style={{ width: '100%', height: mh }}>
                    <div className='shy-page-layout-wrapper' style={style}>
                        {props.children}
                    </div>
                </div>
        }
        else {
            return <div className="flex-center padding-40">
                <span>页面出错了</span>
            </div>
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
                <div>
                    <span><a onClick={e => location.reload()}>刷新</a>或通过<a onClick={e => this.props.page.onOpenHistory()}>历史记录</a>找回</span>
                </div>
            </div>
        }
    }
    componentDidCatch?(error: Error, errorInfo: ErrorInfo): void {
        this.error = error.message;
        this.forceUpdate();
    }
}



