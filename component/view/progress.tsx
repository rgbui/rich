import React from "react";
import { MouseDragger } from "../../src/common/dragger";
import { Rect } from "../../src/common/vector/point";
import "./style.less";

export class MeasureView extends React.Component<{
    min?: number,
    max?: number,
    ratio?: number,
    value: number,
    showValue?: boolean,
    onChange: (value: number) => void,
    unit?: string,
    unitComputed?: (value: number) => number
}>{
    setProgress(e: React.MouseEvent) {
        var pe = this.el.querySelector('.shy-measure-progress') as HTMLElement;
        var bound = Rect.fromEle(pe);
        var self = this;
        var props = self.props;
        let min = (props.min || 0) / (props.ratio || 1);
        let max = (props.max || 10) / (props.ratio || 1);
        var lastValue = props.value;
        function setValue(ev: MouseEvent, isEnd) {
            var dx = ev.clientX - bound.left;
            if (dx < 0) dx = 0;
            else if (dx > bound.width) dx = bound.width;
            var pre = dx * 1.0 / bound.width;
            var value = min + Math.round((max - min) * pre);
            if (value > max) value = max;
            if (value < min) value = min;
            value = Math.round(value);
            var pro = value * (props.ratio || 1);
            pro = parseFloat(pro.toPrecision(12));
            if (lastValue !== pro) {
                self.props.onChange(pro);
                lastValue = pro;
            }
        }
        MouseDragger({
            event: e,
            dis: 0,
            moving(ev, data, isEnd) {
                setValue(ev, false);
            },
            moveEnd(e, isMove, data) {
                setValue(e, true);
            }
        })
    }
    el: HTMLElement;
    render() {
        var props = this.props;
        var value = ((this.props.value || 0) / (props.ratio || 1));
        let min = (props.min || 0) / (props.ratio || 1);
        let max = (props.max || 10) / (props.ratio || 1);
        if (value < min) value = min;
        else if (value > max) value = max;
        let pa = (value - min) / (max - min);
        return <div className='shy-measure' ref={e => this.el = e} onMouseDown={e => e.stopPropagation()} >
            <div className="shy-measure-wrapper" onMouseDown={e => this.setProgress(e)}>
                <div className='shy-measure-progress'>
                    <div className='shy-measure-progress-bar' style={{ width: pa * 100 + '%' }}></div>
                    <div className="shy-measure-progress-circle" style={{ left: pa * 100 + '%' }}></div>
                </div>
            </div>
            {props.showValue !== false && <div className='shy-measure-value'>{typeof this.props.unitComputed == 'function' ? this.props.unitComputed(this.props.value) : this.props.value}{this.props.unit}</div>}
        </div>
    }
}