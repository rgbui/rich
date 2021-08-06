import React from "react";
import ReactDOM,{ createPortal } from "react-dom";
import { Point } from "../../src/common/point";
import { EventsComponent } from "../events.component";
import { BackgroundColorList, FontColorList } from "./data";
export class ColorSelector extends EventsComponent {
    private node: HTMLElement;
    constructor(props) {
        super(props);
        this.node = document.body.appendChild(document.createElement('div'));
    }
    componentWillUnmount() {
        if (this.node) this.node.remove()
    }
    el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
    }
    private visible: boolean = false;
    private pos: Point = new Point(0, 0);
    private renderFontColor() {
        return <div className='shy-color-selector-box'>
            <div className='shy-color-selector-box-head'><span>文字颜色</span></div>
            <div className='shy-color-selector-box-content'>
                {FontColorList.map(x => {
                    return <a style={{ color: x.color }}>A</a>
                })}
            </div>
        </div>;
    }
    private renderBackgroundColor() {
        return <div className='shy-color-selector-box'>
            <div className='shy-color-selector-box-head'><span>背景色</span></div>
            <div className='shy-color-selector-box-content'>
                {BackgroundColorList.map(x => {
                    return <a style={{ backgroundColor: x.color }}>A</a>
                })}
            </div>
        </div>;
    }
    render() {
        var style: Record<string, any> = {
            top: this.pos.y,
            left: this.pos.x
        }
        return createPortal(<div>
            {this.visible && <div className='shy-color-selector'
                style={style}>{this.renderFontColor()}{this.renderBackgroundColor()}</div>}
        </div>, this.node);
    }
}