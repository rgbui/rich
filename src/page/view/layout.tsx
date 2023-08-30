import React, { CSSProperties, ErrorInfo } from "react";
import { Page } from "..";
import { OnlineUsers } from "../../../extensions/at/users";
import { PageLayoutType } from "../declare";
import { ElementType } from "../../../net/element.type";
import { S } from "../../../i18n/view";
import { ls } from "../../../i18n/store";

export class PageLayoutView extends React.Component<{
    page: Page,
    children?: React.ReactNode
}>{
    render(): React.ReactNode {
        if (this.error) return this.renderErrorPage();
        if ([ElementType.Schema, ElementType.SchemaData, ElementType.SchemaRecordView].includes(this.props.page.pe.type) && !this.props.page.schema) {
            return this.renderNotDataSource();
        }
        var props = this.props;
        var type = props.page.pageLayout?.type;
        var mh = props.page.pageVisibleHeight ? (props.page.pageVisibleHeight + 'px') : '100%';
        if (type == PageLayoutType.doc || type == PageLayoutType.recordView) {
            var style: CSSProperties = { minHeight: mh, width: '100%' };
            return <div className='shy-page-layout shy-page-layout-doc' style={style}>
                {/* {props.page.isSchemaRecordViewTemplate && <div className="pos-center-top t-20 w-200 h-30 bg flex-center round f-12">
                    <S>编辑模板</S><span>[{props.page.schema.views.find(c => c.id == props.page.pe.id1)?.text}]</span>
                </div>} */}
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
                    <S>编辑模板</S><span>[{props.page.schema.views.find(c => c.id == props.page.pe.id1)?.text}]</span>
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
                    <div className="flex-fix w-250" style={{ height: mh }}><OnlineUsers ws={this.props.page.ws}></OnlineUsers></div>
                </div>
            }
            else return <div className={"shy-page-layout shy-page-layout-text-channel"} style={{ width: '100%', height: mh }}>
                <div className='shy-page-layout-wrapper' style={style}>
                    {props.children}
                </div>
            </div>
        }
        else {
            return <div className="flex-center padding-40">
                <span><S>页面出错了</S></span>
            </div>
        }
    }
    error: string = '';
    renderErrorPage() {
        if (this.error) {
            return <div>
                <div className="flex-center padding-40">
                    <span><S>页面出错了</S></span>
                </div>
                <div className="flex-center remark">
                    {this.error}
                </div>
                <div className="flex-center remark">
                    <span><a className="cursor" onClick={e => location.reload()}><S>刷新</S></a><S>或通过</S><a className="cursor" onClick={e => this.props.page.onOpenHistory()}><S>历史记录</S></a><S>找回</S></span>
                </div>
            </div>
        }
    }
    renderNotDataSource() {
        return <div>
            <div className="flex-center padding-40">
                <span><S>缺少数据源</S></span>
            </div>
            <div className="flex-center remark">
                <S text='没有查到数据表格请确认是否存在网络问题'>没有查到数据表格，请确认是否存在网络问题，还是已经删除了</S>
            </div>
            <div className="flex-center remark">
                <span><a className="cursor" onClick={e => location.reload()}><S>刷新</S></a><span className={ls.isCn?"":"gap-w-5"}><S>或</S></span><a className="cursor" onClick={async e => {
                    this.props.page.onPageRemove()
                }}><S>删除页面</S></a></span>
            </div>
        </div>
    }
    componentDidCatch?(error: Error, errorInfo: ErrorInfo): void {
        this.error = error.message;
        this.forceUpdate();
    }
}




