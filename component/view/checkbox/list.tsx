import React from "react";
import { CSSProperties } from "react";
import { CheckBox } from ".";
import { util } from "../../../util/util";
import lodash from "lodash";

export class CheckBoxList extends React.Component<{
    disabled?: boolean,
    value?: any,
    multiple?: boolean,
    options: { text?: string, value: any }[],
    onChange?: (value: any) => void,
    style?: CSSProperties,
    gap?: number,
    direction?: 'x' | 'y'
}>{
    render() {
        var vs = util.covertToArray(this.props.value);
        var ch = (e: boolean, op) => {
            if (this.props.multiple) {
                if (vs.includes(op.value)) {
                    lodash.remove(vs, g => g === op.value);
                }
                else vs.push(op.value);
                this.props.onChange(vs);
            }
            else {
                this.props.onChange(op.value);
            }
        }
        if (this.props.direction == 'x') {
            return <div className="flex flex-inline" style={this.props.style || {}}>
                {this.props.options.map((op, i) => {
                    return <CheckBox
                        style={{ marginRight: this.props.gap }}
                        checked={vs.includes(op.value)}
                        onChange={e => ch(e, op)}
                        key={i}>{op.text}</CheckBox>
                })}
            </div>
        }
        else {
            return <div style={this.props.style || {}}>
                {this.props.options.map((op, i) => {
                    return <CheckBox
                        style={{ marginTop: this.props.gap, marginBottom: this.props.gap }}
                        checked={vs.includes(op.value)}
                        onChange={e => ch(e, op)}
                        key={i}>{op.text}</CheckBox>
                })}
            </div>
        }
    }
}