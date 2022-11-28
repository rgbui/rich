import React from "react";
import { Block } from "../..";
import { url, view } from "../../factory/observable";
import { BlockView } from "../../view";
import { TextSpanArea } from "../../view/appear";
@url('/card/box/title')
export class CardBoxTitle extends Block {
    get isSupportTextStyle() {
        return false;
    }
    get isDisabledInputLine() {
        return true;
    }
}
/*** 在一个页面上，从视觉上有多个视图块，
 * 如每个页面都有一个初始的内容视图，不可拖动
 *  但页面可以会有弹层等一些其它的视图
 */
@view('/card/box/title')
export class ViewComponent extends BlockView<CardBoxTitle>{
    render() {
        return <div className='sy-card-box-title' style={this.block.visibleStyle}>
            <div style={this.block.contentStyle} className='sy-card-box-title-content'>
                <TextSpanArea placeholder={"键入卡片标题"} block={this.block}></TextSpanArea>
            </div>
        </div>
    }
}