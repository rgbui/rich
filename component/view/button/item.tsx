
import lodash from "lodash";
import React, { CSSProperties } from "react";
import { IconArguments } from "../../../extensions/icon/declare";
import { Icon } from "../icon";
import { util } from "../../../util/util";

export class SelectItems extends React.Component<{
    disabled?: boolean,
    value?: any,
    multiple?: boolean,
    options: { text?: string, icon?: string | SvgrComponent | JSX.Element | IconArguments, value: any }[],
    onChange?: (value: any) => void,
    style?: CSSProperties,
    gap?: number,
    theme?: 'light' | 'primary' | 'dark'
}>{
    render(): React.ReactNode {
        var vs = util.covertToArray(this.props.value);
        return <div style={this.props.style}>
            {this.props.options.map((g, i) => {
                var classList: string[] = ['cursor', 'padding-w-10'];
                classList.push('padding-h-3')
                if (vs.includes(g.value)) {
                    if (this.props.theme != 'primary')
                        classList.push('item-hover-focus')
                    else if (this.props.theme == 'primary')
                        classList.push(...['text-white', 'bg-primary'])
                }
                else {
                    classList.push(...['text'])
                }
                classList.push('round-8');
                var style: CSSProperties = {
                    borderRadius: 4
                }
                if (this.props.gap) {
                    // style.marginTop = this.props.gap;
                    style.marginBottom = this.props.gap;
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