import React, { CSSProperties } from "react";
import { IconArguments } from "../../../extensions/icon/declare";
import { Icon } from "../icon";
import { util } from "../../../util/util";
import lodash from "lodash";

export class SelectButtons extends React.Component<{
    disabled?: boolean,
    value?: any,
    multiple?: boolean,
    options: { text?: string, icon?: string | SvgrComponent | JSX.Element | IconArguments, value: any }[],
    onChange?: (value: any) => void,
    style?: CSSProperties,
    size?: 'small' | 'normal' | 'large',
    gap?: number
}>{
    render(): React.ReactNode {
        var vs = util.covertToArray(this.props.value);
        return <div className="flex flex-wrap" style={this.props.style}>
            {this.props.options.map((g, i) => {
                var classList: string[] = ['cursor'];
                if (vs.includes(g.value)) classList.push(...['text-white', 'bg-primary'])
                else {
                    classList.push(...['text'])
                    if (!this.props.gap) {
                        classList.push('item-hover-light-focus')
                    }
                }
                var size = this.props.size || 'normal';
                classList.push('round-8');
                if (size == 'normal') classList.push('padding-w-8 padding-h-2');
                else if (size == 'large') classList.push('padding-w-12 padding-h-4');
                else if (size == 'small') classList.push('padding-w-4 padding-h-1');
                var style: CSSProperties = {
                    borderRadius: i == 0 && i == this.props.options.length - 1 ? "4px" : (i == 0 ? '4px 0 0 4px' : (i == this.props.options.length - 1 ? '0 4px 4px 0' : '0px')),
                }
                if (this.props.gap) {
                    style.marginRight = this.props.gap;
                    style.borderRadius = '4px'
                }
                return <div key={i}
                    style={style}
                    onMouseDown={e => {
                        if (this.props.disabled) return;
                        vs = lodash.cloneDeep(vs);
                        if (this.props.multiple) {
                            if (vs.includes(g.value)) {
                                lodash.remove(vs, c => c == g.value);
                            }
                            else {
                                vs.push(g.value);
                            }
                        }
                        else {
                            vs = [g.value];
                        }
                        if (typeof this.props.onChange == 'function') {
                            this.props.onChange(this.props.multiple ? vs : vs[0]);
                        }
                    }}
                    className={classList.join(" ")} >
                    {g.icon && <Icon icon={g.icon}></Icon>}
                    <span>{g.text}</span>
                </div>
            })}
        </div>
    }
}