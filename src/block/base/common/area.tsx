import { BaseBlock } from "..";
import { ContentAreaComposition } from "./composition/content";
import React from 'react';
import { BaseComponent } from "../component";
import { BlockDisplay, BlockType } from "../enum";
import { url, view } from "../../factory/observable";
/**
 * 对视图进行分区，从空间上进行分割，尽可能的利用空间
 */
@url('/view/area')
export class ViewArea extends ContentAreaComposition {
    /**
     * 固定宽度
     */
    width: number;
    
    /**带有百分比的宽度，或者填充余下空间 */
    widthPercent: number | 'fill';
    /***
     * 高度是否为固定，如果固定，
     * 那么内容要么隐藏，
     * 要么产生滚动条
     */
    isFixedHeight: boolean;
    height: number;
    minHeight: number;
    maxHeight: number;
    overflowY: 'hidden' | 'scroll';
    /***
     * 每一行的间距
     */
    rowGap: number;
    display = BlockDisplay.block;
    type = BlockType.layout;
}
@view('/view/area')
export class ViewAreaComponent extends BaseComponent<ViewArea>{
    render() {
        return <div className='block-view-area' >{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>
        )}</div>
    }
}