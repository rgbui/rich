import React from "react";
import { BoardEditTool } from ".";
import { ShySvg } from "../../src/block/svg";
import { getShapeStore } from "../board/shapes/shapes";
import { S } from "../../i18n/view";
import { ToolTip } from "../../component/view/tooltip";
import { BoardToolTextSvg, BoardToolStickerSvg, BoardCardSvg, MindSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { BlockUrlConstant } from "../../src/block/constant";

export function TurnShapes(props: {
    tool: BoardEditTool,
    change?(value: { name?: string, value?: string, svg?: ShySvg, turnUrl?: string }): void,
    turnShapes?: { name?: string, value?: string, svg?: ShySvg, turnUrl?: string }
}) {
    var list = getShapeStore(props.turnShapes.name);
    var rc = list.find(s => s.id == props.turnShapes.value);
    function renderChilds(childs) {
        return childs.map((s, index) => {
            if (s.text && Array.isArray(s.childs) && s.childs.length > 0) {
                return <div key={index}>
                    <div className="h-20 remark f-12 ">{s.text}</div>
                    <div className="flex flex-wrap">{renderChilds(s.childs)}</div>
                </div>
            }
            if (s.shape) {
                return <span
                    className={"r-size-24 item-hover-light gap-b-10 gap-r-10  round  " + (s.id == props.turnShapes.value ? " item-hover-focus" : "")}
                    onMouseDown={e => {
                        e.stopPropagation();
                        props.tool.showDrop('');
                        props.change({ svg: s, value: s.id, name: s.id });
                    }}
                    key={index}
                    dangerouslySetInnerHTML={{ __html: s.shape }}></span>
            }
            var sb = new ShySvg();
            sb.load(s);
            return <div onMouseDown={e => {
                e.stopPropagation();
                props.tool.showDrop('');
                props.change({ svg: s, value: s.id, name: props.turnShapes.name });
            }} className={"size-30 gap-b-10 gap-r-10 item-hover-light flex-center round " + (s.id == props.turnShapes.value ? "item-hover-focus" : "")} key={index}>
                {sb.render({
                    strokeWidth: 1,
                    attrs: {
                        stroke: 'black',
                        strokeWidth: 1,
                        fill: 'none'
                    }
                })}
            </div>
        })
    }
    return <div className="shy-board-trun-shapes">
        <div className="shy-board-trun-shapes-current flex-center" onMouseDown={e => props.tool.showDrop('turnShapes')}>
            {props.turnShapes?.turnUrl && <>
                {props.turnShapes?.turnUrl == BlockUrlConstant.TextSpan && <Icon size={20} icon={BoardToolTextSvg} />}
                {props.turnShapes?.turnUrl == BlockUrlConstant.Note && <Icon size={20} icon={BoardToolStickerSvg} />}
                {props.turnShapes?.turnUrl == BlockUrlConstant.Mind && <Icon size={20} icon={MindSvg} />}
                {props.turnShapes?.turnUrl == BlockUrlConstant.BoardPageCard && <Icon size={20} icon={BoardCardSvg} />}
            </>}
            {props?.turnShapes?.svg && <span className="size-16 flex-center" >
                {rc?.shape && <span className="flex-center size-16 " dangerouslySetInnerHTML={{ __html: rc.shape }}></span>}
                {!rc?.shape && props?.turnShapes?.svg.render(
                    {
                        strokeWidth: 1,
                        attrs: {
                            stroke: 'black',
                            strokeWidth: 1,
                            fill: 'none'
                        }
                    }
                )}
            </span>}
        </div>
        {props.tool.isShowDrop('turnShapes') && <div
            className="shy-board-trun-shapes-drops overflow-y"
            style={{ maxHeight: 300, width: 250 }}>
            <div>
                <div className="f-14 gap-b-5"><S>切换文本或便签</S></div>
                <div className="flex flex-wrap">

                    <ToolTip overlay={<S>文本</S>}><span onMouseDown={e => {
                        e.stopPropagation();
                        props.tool.showDrop('');
                        props.change({ turnUrl: BlockUrlConstant.TextSpan });
                    }} className={"gap-b-10 gap-r-10 item-hover-light  size-24 flex-center " + (BlockUrlConstant.TextSpan == props.turnShapes.turnUrl ? " item-hover-focus" : "")}> <Icon size={20} icon={BoardToolTextSvg} /></span></ToolTip>

                    <ToolTip overlay={<S>便签</S>}><span onMouseDown={e => {
                        e.stopPropagation();
                        props.tool.showDrop('');
                        props.change({ turnUrl: BlockUrlConstant.Note });
                    }} className={"gap-b-10 gap-r-10 item-hover-light size-24 flex-center " + ((BlockUrlConstant.Note == props.turnShapes.turnUrl ? " item-hover-focus" : ""))}> <Icon size={20} icon={BoardToolStickerSvg} /></span></ToolTip>

                    <ToolTip overlay={<S>思维导图</S>}><span onMouseDown={e => {
                        e.stopPropagation();
                        props.tool.showDrop('');
                        props.change({ turnUrl: BlockUrlConstant.Mind });
                    }} className={"gap-b-10 gap-r-10 item-hover-light size-24 flex-center " + ((BlockUrlConstant.Mind == props.turnShapes.turnUrl ? " item-hover-focus" : ""))}> <Icon size={20} icon={MindSvg} /></span></ToolTip>


                    <ToolTip overlay={<S>文档</S>}><span onMouseDown={e => {
                        e.stopPropagation();
                        props.tool.showDrop('');
                        props.change({ turnUrl: BlockUrlConstant.BoardPageCard });
                    }} className={"gap-b-10 gap-r-10 item-hover-light size-24 flex-center " + ((BlockUrlConstant.BoardPageCard == props.turnShapes.turnUrl ? " item-hover-focus" : ""))}> <Icon size={20} icon={BoardCardSvg} /></span></ToolTip>

                </div>
            </div>
            <div>
                <div className="f-14  gap-b-5"><S>切换图形</S></div>
                <div className="flex flex-wrap">{renderChilds(list)}</div>
            </div>
        </div>}
    </div>
}