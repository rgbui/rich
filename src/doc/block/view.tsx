import { BaseBlock } from "./base";
import { ContentAreaComposition } from "./composition/content";
import React from 'react';
import ReactDOM from 'react-dom';
export function ViewComponent(props) {
    console.log(props);
    if (props.model && Array.isArray(props.model.childs))
        return <div>{props.model.childs.map(x =>
            <x.viewComponent key={x.id} model={x.model}></x.viewComponent>
        )}</div>
    else return <div>s</div>
}


/**
 * 在一个页面上，从视觉上有多个视图块，
 * 如每个页面都有一个初始的内容视图，不可拖动
 *  但页面可以会有弹层等一些其它的视图
 */
export class View extends BaseBlock {
    /**
     * 是否为内容视图
     */
    isRockView: boolean;
    contentAreaComposition: ContentAreaComposition;
}
/**
 * 对视图进行分区，从空间上进行分割，尽可能的利用空间
 */
export class ViewArea extends BaseBlock {
    contentAreaComposition: ContentAreaComposition;
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
}
/**
 * 分区中会有很多行，每行存在于一个或多个block
 */
export class Row extends BaseBlock {

}
