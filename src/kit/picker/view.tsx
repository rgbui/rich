import React, { CSSProperties } from "react";
import { BlockPicker } from ".";
import { Line } from "../../../blocks/board/line/line";
import { PlusSvg, RotatingSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { Block } from "../../block";
import { BoardPointType } from "../../block/partial/board";
import { PointArrow, Rect } from "../../common/vector/point";
import { Tip } from "../../../component/view/tooltip/tip";
import { Sp } from "../../../i18n/view";
import "./style.less";

export class BlockPickerView extends React.Component<{ picker: BlockPicker }> {
    constructor(props) {
        super(props);
        this.picker.view = this;
    }
    get picker() {
        return this.props.picker;
    }
    renderBlockRange(block: Block) {
        var r = 5;
        var connectR = 3;
        var pickers = block.getBlockBoardSelector([
            BoardPointType.path,
            BoardPointType.lineMovePort,
            BoardPointType.brokenLinePort,
            BoardPointType.brokenLineSplitPort,
            BoardPointType.connectPort,
            BoardPointType.resizePort
        ]);
        var sizePick = pickers.find(c => c.type == BoardPointType.path && c.arrows.includes(PointArrow.bottom));
        var sp = sizePick?.poly?.bound.middleCenter?.move(0, 16);
        var scale = block.matrix.getScaling().x;
        var spText = (block.fixedSize.width * scale).toFixed(0) + "x" + (block.fixedSize.height * scale).toFixed(0)

        var rp = pickers.find(c => c.type == BoardPointType.rotatePort);
        var rpText = block.matrix.clone().append(block.moveMatrix).getRotation().toFixed(0) + '°';
        return <g key={block.id}>
            {pickers.map((pi, i) => {
                switch (pi.type) {
                    case BoardPointType.path:
                        if (block.isLock) return <g key={i}></g>
                        var cursor = 'n-resize';
                        if (pi.arrows.includes(PointArrow.right)) cursor = 'e-resize';
                        else if (pi.arrows.includes(PointArrow.bottom)) cursor = 's-resize';
                        else if (pi.arrows.includes(PointArrow.left)) cursor = 'w-resize';
                        return <path key={i}
                            fillOpacity={typeof pi.fillOpacity == 'number' ? pi.fillOpacity : 0.8}
                            onMouseDown={e => { block.isLock ? undefined : this.picker.onResizeBlock(block, pi.arrows, e) }}
                            style={{ cursor: cursor }}
                            d={pi.poly.pathString()}></path>
                    case BoardPointType.lineSplitPort:
                        return <circle onMouseDown={e => {
                            if (block.isLock) return;
                            this.picker.onSplitLinePort(block as Line, pi, e)
                        }} className="line-split-port" key={i} cx={pi.point.x} cy={pi.point.y} r={connectR}  ></circle>
                    case BoardPointType.brokenLinePort:
                        return <circle onMouseDown={e => {
                            if (block.isLock) return;
                            this.picker.onBrokenLinePort(block as Line, pi, e)
                        }
                        } className="move-port" key={i} cx={pi.point.x} cy={pi.point.y} r={connectR}  ></circle>
                    case BoardPointType.brokenLineSplitPort:
                        return <circle onMouseDown={e => {
                            if (block.isLock) return;
                            this.picker.onBrokenLinePort(block as Line, pi, e)
                        }
                        } className="line-split-port" key={i} cx={pi.point.x} cy={pi.point.y} r={connectR}  ></circle>
                    case BoardPointType.lineMovePort:
                        if (block.isLock) return <g key={i} ></g>
                        return <circle onMouseDown={e => this.picker.onMovePortBlock(block as Line, pi, e)} className="move-port" key={i} cx={pi.point.x} cy={pi.point.y} r={r}   ></circle>
                    case BoardPointType.connectPort:
                        return <circle onMouseDown={e => this.picker.onCreateBlockConnect(block, pi.arrows, e)} className="connect" key={i} cx={pi.point.x} cy={pi.point.y} r={connectR}  ></circle>
                    case BoardPointType.resizePort:
                        if (block.isLock) return <g key={i} ></g>
                        var cursor = 'ne-resize';
                        if (pi.arrows.includes(PointArrow.top) && pi.arrows.includes(PointArrow.right)) cursor = 'ne-resize'
                        else if (pi.arrows.includes(PointArrow.top) && pi.arrows.includes(PointArrow.left)) cursor = 'nw-resize'
                        else if (pi.arrows.includes(PointArrow.bottom) && pi.arrows.includes(PointArrow.left)) cursor = 'sw-resize'
                        else if (pi.arrows.includes(PointArrow.bottom) && pi.arrows.includes(PointArrow.right)) cursor = 'se-resize'
                        return <circle
                            key={i}
                            onMouseDown={e => this.picker.onResizeBlock(block, pi.arrows, e)}
                            style={{ cursor: cursor }}
                            r={r} cx={pi.point.x} cy={pi.point.y}
                        ></circle>
                        break;
                    case BoardPointType.rotatePort:
                        if (block.isLock) return <g key={i} ></g>
                        return <foreignObject key={i}
                            width={20}
                            height={20}
                            onMouseDown={e => this.picker.onRotateBlock(block, pi, e)}
                            x={pi.point.x}
                            y={pi.point.y}>
                            <Tip overlay={<Sp text='拖动旋转点击重置'>拖动旋转<br />点击重置</Sp>}><Icon className={'cursor'} icon={RotatingSvg} size={16}></Icon></Tip>
                        </foreignObject>
                    case BoardPointType.mindAdd:
                        var s = 18;
                        return <foreignObject
                            className="mind-add"
                            key={i}
                            width={s}
                            height={s}
                            onMouseDown={e => this.picker.onPickerMousedown(block, pi, e)}
                            x={pi.point.x - s / 2}
                            y={pi.point.y - s / 2}>
                            <div className="size-16 flex-center cursor" >
                                <Icon size={14} icon={PlusSvg}></Icon>
                            </div>
                        </foreignObject>
                        break;
                    case BoardPointType.mindSpread:
                        var s = 14;
                        var ox = pi.point.x - s / 2;
                        var oy = pi.point.y - s / 2;
                        if (pi.arrows.includes(PointArrow.top)) {
                            oy = pi.point.y - s;
                        }
                        else if (pi.arrows.includes(PointArrow.bottom)) {
                            oy = pi.point.y;
                        }
                        else if (pi.arrows.includes(PointArrow.left)) {
                            ox = pi.point.x - s;
                        }
                        else {
                            ox = pi.point.x
                        }
                        return <foreignObject
                            className="mind-add"
                            key={i}
                            width={s}
                            height={s}
                            onMouseDown={e => this.picker.onPickerMousedown(block, pi, e)}
                            x={ox}
                            y={oy}>
                            <div className="size-12 flex-center cursor" >
                                <Icon size={8} icon={{ name: 'byte', code: 'minus' }}></Icon>
                            </div>
                        </foreignObject>
                        break;
                }
            })}
            {this.showSize && sizePick && <g style={{ pointerEvents: 'none' }}>
                <foreignObject
                    width={spText.length * 10}
                    height={24}
                    x={sp?.x - spText.length * 10 / 2}
                    y={sp?.y - 24 / 2}
                >
                    <div className="flex-center f-14 text-white bg-primary round">
                        {spText}
                    </div>
                </foreignObject>
            </g>}
            {this.showAngle && rp && <g style={{ pointerEvents: 'none' }}>
                <foreignObject
                    width={rpText.length * 10}
                    height={20}
                    x={rp.point.x + rpText.length * 10}
                    y={rp.point.y}>
                    <div className="flex-center f-14 text-white bg-primary round">
                        {rpText}
                    </div>
                </foreignObject>
            </g>}
        </g>
    }
    showSize: boolean = false;
    showAngle: boolean = false;
    render() {
        var style: CSSProperties = {
            zIndex: 10000,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh'
        }
        var viewBox
        var b = this.picker.blocks[0];
        if (b?.page && !b.page.isBoard) {
            var bb = this.picker.kit.boardSelector.boardBlock;
            if (bb) {
                var fb = bb.getVisibleContentBound();
                delete style.bottom;
                delete style.right;
                var rc = Rect.fromEle(b.page.contentEl);
                style.width = fb.width + 'px';
                style.height = fb.height + 'px';
                style.top = fb.top - rc.top + 'px';
                style.left = fb.left - rc.left + 'px';
                viewBox = `${fb.left - rc.left} ${fb.top - rc.top} ${fb.width} ${fb.height}`;
            }
        }
        return <div className='shy-kit-picker'>
            {this.picker.visible && <svg viewBox={viewBox ?? undefined} className="shy-kit-picker-svg" style={style}>
                {this.picker.blocks.map(block => {
                    return this.renderBlockRange(block);
                })}
                {this.picker.alighLines.map((line, i) => {
                    return <line
                        key={i}
                        x1={line.start.x}
                        y1={line.start.y}
                        x2={line.end.x}
                        y2={line.end.y}
                        stroke="#64a1df"
                        strokeWidth="1"
                    ></line>
                })}
            </svg>}
        </div>
    }
}