import React from "react";
import { BoardEditTool } from "..";
import { lst } from "../../../i18n/store";
import { Icon } from "../../../component/view/icon";
import { ToolTip } from "../../../component/view/tooltip";
import {
    BoardRankGridSvg,
    BoardRankSvg,
    BoardRankTypeSvg,
    BoardRankXSvg,
    BoardRankYSvg
} from "../../../component/svgs";

export function AlignNineGridView(props: {
    name: string,
    tool: BoardEditTool,
    change?(value: string): void
}) {
    var aligns = [
        { text: lst('左对齐'), icon: { name: 'byte', code: 'align-left-two' }, value: 'left' },
        { text: lst('垂直对齐'), icon: { name: 'byte', code: 'align-vertical-center-two' }, value: 'center' },
        { text: lst('右对齐'), icon: { name: 'byte', code: 'align-right-two' }, value: 'right' },
    ];
    var cs = [
        { text: lst('上对齐'), icon: { name: 'byte', code: 'align-top-two' }, value: 'top' },
        { text: lst('水平对齐'), icon: { name: 'byte', code: 'align-horizontal-center-two' }, value: 'middle' },
        { text: lst('下对齐'), icon: { name: 'byte', code: 'align-bottom-two' }, value: 'bottom' },
    ];
    var ds = [
        { text: lst('水平分布'), icon: { name: 'byte', code: 'distribute-horizontally' }, value: 'x' },
        { text: lst('垂直分布'), icon: { name: 'byte', code: 'distribute-vertically' }, value: 'y' },
    ];
    return <div className="shy-board-edit-background-color">
        <div className="shy-board-edit-background-color-current size-20 flex-center">
            <Icon icon={{ name: 'byte', code: 'align-left-one' }} size={16}></Icon>
        </div>
        {props.tool.isShowDrop(props.name) && <div style={{ position: 'absolute', top: 20, transform: 'translate(-50%, 0px)' }}> <div
            style={{ marginTop: 15, height: 90, width: 'auto', minHeight: 'auto', padding: '5px 0px' }}
            className=" bg-white shadow-s round">

            <div className="h-30 flex r-item-hover r-round r-cursor r-gap-w-5">
                {aligns.map((g, i) => {
                    return <ToolTip key={i} overlay={g.text} ><span onMouseDown={e => {
                        props.change(g.value);
                    }} key={i} className={"flex-center size-24 round" + "item-hover-light"}>
                        <Icon icon={g.icon as any} size={16}></Icon>
                    </span></ToolTip>
                })}
            </div>

            <div className="h-30 flex r-item-hover r-round r-cursor r-gap-w-5">
                {cs.map((g, i) => {
                    return <ToolTip key={i} overlay={g.text} >
                        <span onMouseDown={e => {
                            props.change(g.value);
                        }} className={"flex-center size-24 round" + "item-hover-light"}>
                            <Icon icon={g.icon as any} size={16}></Icon>
                        </span>
                    </ToolTip>
                })}
            </div>

            <div className="h-30 flex r-item-hover r-round r-cursor r-gap-w-5">
                {ds.map((g, i) => {
                    return <ToolTip key={i} overlay={g.text} ><span onMouseDown={e => {
                        props.change(g.value);
                    }} key={i} className={"flex-center size-24 round" + "item-hover-light"}>
                        <Icon icon={g.icon as any} size={16}></Icon>
                    </span>
                    </ToolTip>
                })}
            </div>
        </div>
        </div>}
    </div>
}

/**
 * 排版
 * 水平排版
 * 垂直排版
 * 网络排版
 * @param props 
 */
export function RankGridView(props: {
    name: string,
    tool: BoardEditTool,
    change?(value: string): void
}) {
    var aligns = [
        { text: lst('横向排列'), icon: BoardRankXSvg, value: 'x' },
        { text: lst('竖直排列'), icon: BoardRankYSvg, value: 'y' },
        { text: lst('分类排列'), icon: BoardRankTypeSvg, value: 'type' },
        { text: lst('网格排列'), icon: BoardRankGridSvg, value: 'grid' },
    ];
    return <div className="shy-board-edit-background-color">
        <div className="shy-board-edit-background-color-current size-20 flex-center">
            <Icon icon={BoardRankSvg} size={18}></Icon>
        </div>
        {props.tool.isShowDrop(props.name) && <div style={{
            position: 'absolute',
            top: 20,
            transform: 'translate(-50%, 0px)'
        }}> <div
            style={{
                marginTop: 15,
                height: 120,
                width: 160,
                minHeight: 'auto',
                padding: '5px 0px'
            }}
            className=" bg-white shadow-s round">
                <div className="r-item-hover r-round r-cursor r-gap-w-5">
                    {aligns.map((g, i) => {
                        return <div onMouseDown={e => {
                            props.change(g.value);
                        }} key={i} className="flex h-30 padding-w-5">
                            <span className={"flex flex-fixed text-1  size-24 round" + "item-hover-light"}>
                                <Icon icon={g.icon as any} size={20}></Icon>
                            </span>
                            <span className="flex-auto f-14 text-1">{g.text}</span>
                        </div>
                    })}
                </div>
            </div>
        </div>}
    </div>
}