import React from "react";
import { Block } from "../..";
import { url, view } from "../../factory/observable";
import { BlockView } from "../../view";
@url('/card/box/title')
export class CardBoxTitle extends Block {
    
}
/*** 在一个页面上，从视觉上有多个视图块，
 * 如每个页面都有一个初始的内容视图，不可拖动
 *  但页面可以会有弹层等一些其它的视图
 */
@view('/card/box/title')
export class ViewComponent extends BlockView<CardBoxTitle>{
    render() {
        return <div className='sy-card-box' >

        </div>
    }
}