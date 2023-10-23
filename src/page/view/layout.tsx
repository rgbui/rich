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
        var pageContentStyle: CSSProperties = {}
        if (this.props.page.pageTheme?.bgStyle) {
            var bs = this.props.page.pageTheme.bgStyle;
            if (bs.mode == 'color') pageContentStyle.backgroundColor = bs.color;
            else if (bs.mode == 'image' || bs.mode == 'uploadImage') {
                pageContentStyle.backgroundImage = `url(${bs.src})`;
                pageContentStyle.backgroundSize = 'cover';
                pageContentStyle.backgroundRepeat = 'no-repeat';
                pageContentStyle.backgroundPosition = 'center center';
                pageContentStyle.backgroundAttachment = 'fixed';
            }
            else if (bs.mode == 'grad') {
                pageContentStyle.backgroundImage = bs?.grad?.bg;
                pageContentStyle.backgroundSize = 'cover';
                pageContentStyle.backgroundRepeat = 'no-repeat';
                pageContentStyle.backgroundPosition = 'center center';
                pageContentStyle.backgroundAttachment = 'fixed';
            }
        }
        var props = this.props;
        var type = props.page.pageLayout?.type;
        var mh = props.page.pageVisibleHeight ? (props.page.pageVisibleHeight + 'px') : '100%';
        if (type == PageLayoutType.doc || type == PageLayoutType.recordView) {
            var style: CSSProperties = { minHeight: mh, width: '100%', ...pageContentStyle };
            return <div className='shy-page-layout shy-page-layout-doc' style={style}>
                {props.children}
            </div>
        }
        else if (type == PageLayoutType.docCard) {
            var style: CSSProperties = { minHeight: mh, width: '100%', ...pageContentStyle };
            return <div className='shy-page-layout shy-page-layout-doc-card' style={style}>
                {props.children}
            </div>
        }
        else if (type == PageLayoutType.db) {
            var style: CSSProperties = { minHeight: mh, width: '100%', ...pageContentStyle };
            return <div className='shy-page-layout shy-page-layout-db' style={style}>
                {props.children}
            </div>
        }
        else if (type == PageLayoutType.board) {
            var style: CSSProperties = { minHeight: mh, width: '100%', ...pageContentStyle };
            Object.assign(style, props.page.matrix.getCss());
            return <div className={"shy-page-layout shy-page-layout-board"} style={{ width: '100%', height: mh }}>
                <div className='shy-page-layout-wrapper' style={style}>
                    {props.children}
                </div>
            </div>
        }
        else if (type == PageLayoutType.textChannel) {
            var style: CSSProperties = { minHeight: mh, width: '100%', ...pageContentStyle };
            Object.assign(style, props.page.matrix.getCss());
            var sr = props.page.getScreenStyle();
            sr.backgroundColor = '#fff';
            // sr.borderRadius = 16;
            sr.boxShadow = 'rgba(18, 18, 18, 0.1) 0px 1px 3px 0px';
            var cs = props.page.pageTheme?.contentStyle;
            if (cs.transparency == 'frosted') {
                sr.backdropFilter = 'blur(20px) saturate(170%)';
                sr.backgroundColor = 'rgba(255,255,255, 0.85)';
            }
            else if (cs.transparency == 'faded') {
                sr.backgroundColor = 'rgba(255,255,255, 0.85)';
            }
            else if (cs.transparency == 'solid') {
                sr.backgroundColor = '#fff'
            }
            if (props.page.showMembers) {
                return <div style={{ ...style }}>
                    <div className="flex flex-top" style={{ ...sr, height: mh }}>
                        <div className="flex-auto">{props.children}</div>
                        <div className="flex-fix w-250" style={{ height: mh, borderLeft: '1px solid rgba(6, 6, 7, 0.08)' }}><OnlineUsers ws={this.props.page.ws}></OnlineUsers></div>
                    </div>
                </div>
            }
            else return <div style={{ ...style }}>
                <div style={{ ...sr, height: mh }}>
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
                <span><a className="cursor"
                    onClick={e => location.reload()}><S>刷新</S></a><span className={ls.isCn ? "" : "gap-w-5"}><S>或</S></span><a className="cursor" onClick={async e => {
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




