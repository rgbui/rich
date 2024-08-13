import React from "react";
import { MeasureView } from "../../../component/view/progress";
import { S } from "../../../i18n/view";

export class MeasureText extends React.Component<{
    label?: string,
    min?: number,
    max?: number,
    ratio?: number,
    value: number,
    onChange?: (value: number) => void
}> {
    refValue: HTMLElement;
    render() {
        var gv = (v) => {
            if (v >= 0 && v <= 1) return (Math.round(v * 10) * 0.1).toFixed(1);
            else return Math.round(v).toString();
        }
        return <>
            <div className="shy-measure-view-label"><label className="f-12 remark">{this.props.label || <S>透明度</S>}</label><span className="f-12 remark" ref={e => this.refValue = e} style={{ float: 'right' }}>{gv(this.props.value)}</span></div>
            <MeasureView
                theme="light"
                min={this.props.min || 0}
                ratio={this.props.ratio || 0.1}
                max={this.props.max || 1}
                showValue={false}
                value={this.props.value}
                inputting={false}
                onInput={e => {
                    this.refValue.innerText = gv(e);
                }}
                onChange={e => {
                    this.props.onChange(e);
                }}></MeasureView></>
    }
}