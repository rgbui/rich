
import React, { CSSProperties } from 'react';
import { BlockView } from "../view";
import { url, view } from "../factory/observable";
import { Block } from '..';
import { ChildsArea } from '../view/appear';
import { PageLayoutType } from '../../page/declare';

@url('/view')
export class View extends Block {
    get isView() {
        return true;
    }
    async getMd() {
        var tag = '';
        if (this.childs.length > 0) return tag + '' + (await (this.childs.asyncMap(async b => await b.getMd()))).join('') + "  "
        else return tag + '' + this.content + "  "
    }
}
/*** 在一个页面上，从视觉上有多个视图块，
 * 如每个页面都有一个初始的内容视图，不可拖动
 *  但页面可以会有弹层等一些其它的视图
 */
@view('/view')
export class ViewComponent extends BlockView<View>{
    render() {
        if (this.block.page.isSupportScreen) {
            var isFirst = this.block.page.views[0] == this.props.block;
            var hasGap: boolean = true;
            var style = this.block.page.getScreenStyle();
            var page = this.block.page;
            var pd = page.getPageDataInfo();
            if (page.nav == true) {
                style = {};
            }
            if (isFirst && pd?.icon && pd?.cover?.abled === true) {
                style.paddingTop = 50;
            }
            var pageContentClassList: string[] = ['sy-block-view-wrapper-content'];
            if (this.block.page?.pageLayout?.type == PageLayoutType.docCard) {
                style.display = 'block';
                style.width = '100%';
                delete style.paddingLeft;
                delete style.paddingRight;
                delete style.paddingTop;
                hasGap = false;
            }
            var isMainView = this.block.page.views[0] == this.block ? true : false;
            return <div className={'sy-block-view' + (this.props.block.page.isPageContent && isMainView ? " sy-block-view-content" : "")} >
                <div className={'sy-block-view-wrapper'} style={style}>
                    <div className={pageContentClassList.join(" ")}>
                        {/* {hasGap && <div style={{ height: 10, display: 'block' }}></div>} */}
                        <ChildsArea childs={this.block.childs}></ChildsArea>
                    </div>
                </div>
            </div>
        }
        else {
            var style: CSSProperties = {};
            if (this.block.page?.pageLayout?.type == PageLayoutType.docCard) {
                style.display = 'block';
                style.width = '100%';
            }
            return <div className='sy-block-view' style={style} ><ChildsArea childs={this.block.childs}></ChildsArea></div>
        }
    }
}
