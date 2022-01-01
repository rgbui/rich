import React from "react";
import ReactDOM, { createPortal } from "react-dom";
import { BlockPicker } from ".";
import { Block } from "../../block";
import { Rect, RectUtility } from "../../common/point";
import "./style.less";
export class BlockPickerView extends React.Component<{ picker: BlockPicker }> {
    constructor(props) {
        super(props);
        this.node = document.body.appendChild(document.createElement('div'));
        this.picker.view = this;
    }
    private node: HTMLElement;
    get picker() {
        return this.props.picker;
    }
    componentWillUnmount() {
        if (this.node) this.node.remove()
    }
    el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
    }
    renderBlockRange(b: { block: Block, rect: Rect }) {
        var r = 5;
        var rs = RectUtility.getRectLineRects(b.rect, 1);
        var extendRect = b.rect.extend(20);
        var centerPoints = extendRect.centerPoints;
        return <g key={b.block.id}>
            {rs.map((r, i) => {
                return <path d={r.pathString} key={i}></path>
            })}
            <circle r={r} cx={b.rect.leftTop.x} cy={b.rect.leftTop.y}></circle>
            <circle r={r} cx={b.rect.rightTop.x} cy={b.rect.rightTop.y}></circle>
            <circle r={r} cx={b.rect.leftBottom.x} cy={b.rect.leftBottom.y}></circle>
            <circle r={r} cx={b.rect.rightBottom.x} cy={b.rect.rightBottom.y}></circle>
            {centerPoints.map((rc, i) => {
                return <circle key={i} cx={rc.x} cy={rc.y} r={r}  ></circle>
            })}
        </g>
    }
    render() {
        return createPortal(<div className='shy-kit-picker'>
            {this.picker.visible && <svg className="shy-kit-picker-svg" style={{ zIndex: 10000 }}>
                {this.picker.blockRanges.map(range => {
                    return this.renderBlockRange(range);
                })}
            </svg>}
        </div>, this.node)
    }
}