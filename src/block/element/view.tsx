
import React from 'react';
import { BlockView } from "../view";
import { url, view } from "../factory/observable";
import { Block } from '..';
@url('/view')
export class View extends Block {
    get isLayout() {
        return true;
    }
    get isArea() {
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
        if (this.block && Array.isArray(this.block.childs))
            return <div className='sy-block-view' >{this.block.childs.map(x => <x.viewComponent key={x.id} block={x}></x.viewComponent>
            )}</div>
        else return <div className='sy-block-view' ></div>
    }
}
