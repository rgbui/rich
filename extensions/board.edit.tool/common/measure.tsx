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
        return <>
            <div className="shy-measure-view-label"><label className="f-12 remark">{this.props.label || <S>透明度</S>}</label><span className="f-12 remark" ref={e => this.refValue = e} style={{ float: 'right' }}>{Math.round(this.props.value)}</span></div>
            <MeasureView
                theme="light"
                min={this.props.min || 0}
                ratio={this.props.ratio || 0.1}
                max={this.props.max || 1}
                showValue={false}
                value={this.props.value}
                inputting={false}
                onInput={e => {
                    this.refValue.innerText = Math.round(e).toString();
                }}
                onChange={e => {
                    this.props.onChange(e);
                }}></MeasureView></>
    }
}