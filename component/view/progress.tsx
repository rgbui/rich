import React from "react";
import { MouseDragger } from "../../src/common/dragger";
import { Rect } from "../../src/common/vector/point";
import { util } from "../../util/util";
import "./style.less";

export class MeasureView extends React.Component<{
    min?: number,
    max?: number,
    ratio?: number,
    value: number,
    showValue?: boolean,
    inputting?: boolean,
    onChange: (value: number) => void,
    unit?: string,
    unitComputed?: (value: number) => number,
    theme?: 'primary' | 'dark' | 'light'
}>{
    constructor(props) {
        super(props);
        this.currentValue = util.nf(this.props.value, 0);
    }
    currentValue: number;
    componentDidUpdate(prevProps: Readonly<{ min?: number; max?: number; ratio?: number; value: number; showValue?: boolean; inputting?: boolean; onChange: (value: number) => void; unit?: string; unitComputed?: (value: number) => number; }>, prevState: Readonly<{}>, snapshot?: any): void {
        if (this.props.value !== prevProps.value) {
            this.currentValue = util.nf(this.props.value, 0);
            this.forceUpdate()
        }
    }
    setProgress(e: React.MouseEvent) {
        var pe = this.el.querySelector('.shy-measure-progress') as HTMLElement;
        var bound = Rect.fromEle(pe);
        var self = this;
        var props = self.props;
        var r = util.nf(props.ratio, 1);
        let min = util.nf(props.min, 0) / r;
        let max = util.nf(props.max, 10) / r;
        var lastValue = this.currentValue;
        function setValue(ev: MouseEvent, isEnd) {
            var dx = ev.clientX - bound.left;
            if (dx < 0) dx = 0;
            else if (dx > bound.width) dx = bound.width;
            var pre = dx * 1.0 / bound.width;
            var value = min + Math.round((max - min) * pre);
            if (value > max) value = max;
            if (value < min) value = min;
            value = Math.round(value);
            var pro = value * r;
            pro = parseFloat(pro.toPrecision(12));
            if (lastValue !== pro || isEnd == true) {
                self.currentValue = pro;
                lastValue = pro;
                self.forceUpdate();
                if (self.props.inputting === false && isEnd == false) return;
                self.props.onChange(pro);
            }
        }
        MouseDragger({
            event: e,
            dis: 0,
            moving(ev, data, isEnd) {
                setValue(ev, isEnd);
            }
        })
    }
    el: HTMLElement;
    render() {
        var props = this.props;
        var r = util.nf(props.ratio, 1);
        var value = this.currentValue / r;
        let min = util.nf(props.min, 0) / r;
        let max = util.nf(props.max, 10) / r;
        if (value < min) value = min;
        else if (value > max) value = max;
        let pa = (value - min) / (max - min);
        return <div className='shy-measure' ref={e => this.el = e} onMouseDown={e => e.stopPropagation()} >
            <div className="shy-measure-wrapper" onMouseDown={e => this.setProgress(e)}>
                <div className='shy-measure-progress'>
                    <div className={'shy-measure-progress-bar ' } style={{ width: pa * 100 + '%' }}></div>
                    <div className={"shy-measure-progress-circle "+ (this.props.theme ? 'shy-measure-progress-' + this.props.theme : "")} style={{ left: pa * 100 + '%' }}></div>
                </div>
            </div>
            {props.showValue !== false && <div className='shy-measure-value'>{typeof this.props.unitComputed == 'function' ? this.props.unitComputed(this.props.value) : this.props.value}{this.props.unit}</div>}
        </div>
    }
}