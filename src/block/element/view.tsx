
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
}
/*** 在一个页面上，从视觉上有多个视图块，
 * 如每个页面都有一个初始的内容视图，不可拖动
 *  但页面可以会有弹层等一些其它的视图
 */
@view('/view')
export class ViewComponent extends BlockView<View>{
    render() {
        if (this.block.page.isSupportScreen) {
            var style = this.block.page.getScreenStyle();
            if (this.block.page.nav == true) {
                style = {};
            }
            return <div className='sy-block-view' >
                <div className='sy-block-view-wrapper' style={style}>
                    <div style={{ height: 10, display: 'block' }}></div>
                    <ChildsArea childs={this.block.childs}></ChildsArea>
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
