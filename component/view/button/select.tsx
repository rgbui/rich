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
    gap?: number,
    theme?: 'default' | 'ghost'
}> {
    render() {
        var vs = util.covertToArray(this.props.value);
        var mousedown = (e, g) => {
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
        }
        if (typeof this.props.gap == 'number') {
            return <div className="flex flex-wrap f-14" style={this.props.style}>
                {this.props.options.map((g, i) => {
                    var classList: string[] = ['flex', 'round', 'cursor'];
                    if (vs.includes(g.value)) classList.push(...['text-white', 'bg-primary'])
                    else {
                        classList.push(...['text'])
                        if (!this.props.gap) {
                            // classList.push('item-hover-light-focus')
                        }
                    }
                    var size = this.props.size || 'normal';
                    if (size == 'normal' || size == 'small') classList.push('padding-w-8');
                    else if (size == 'large') classList.push('padding-w-12 padding-h-4');
                    return <div
                        style={{ marginRight: this.props.gap }}
                        className={classList.join(" ")} key={i} onMouseDown={e => mousedown(e, g)}>{g.icon && <Icon className={'flex-fixed'}
                            icon={{ ...(g.icon as any), color: 'inherit' }}
                        ></Icon>}
                        <span className={'flex-fixed'}>{g.text}</span></div>
                })}
            </div>
        }
        if (this.props?.theme == 'ghost') {
            var bgStyle: CSSProperties = {
                backgroundColor: 'rgba(55, 53, 47, 0.06)',
            };
            return <div className="flex round h-30 padding-w-5" style={bgStyle}>
                {this.props.options.map((g, i) => {
                    var classList: string[] = ['cursor', 'flex-center', 'f-14', 'padding-w-12', 'h-24'];
                    if (vs.includes(g.value)) {
                        classList.push(...['shadow-s', 'bg-white', 'text', 'round'])
                    }
                    var style: CSSProperties = {};
                    return <div key={i}
                        style={style}
                        onMouseDown={e => mousedown(e, g)}
                        className={classList.join(" ")} >
                        {g.icon && <Icon icon={{ ...(g.icon || {} as any), color: 'inherit' }}></Icon>}
                        <span>{g.text}</span>
                    </div>
                })}
            </div>
        }
        return <div className="flex flex-wrap border round f-14" style={this.props.style}>
            {this.props.options.map((g, i) => {
                var classList: string[] = ['cursor'];
                if (vs.includes(g.value)) {
                    if (this.props.theme == 'ghost') classList.push(...['shadow-s', 'text'])
                    else classList.push(...['text-white', 'bg-primary'])
                }
                else {
                    classList.push(...['text'])
                    if (!this.props.gap) {
                    }
                }
                var size = this.props.size || 'normal';
                if (size == 'normal' || size == 'small') classList.push('padding-w-8');
                else if (size == 'large') classList.push('padding-w-12 padding-h-4');
                var style: CSSProperties = {};
                if (i == 0 && i == this.props.options.length - 1) style.borderRadius = '4px';
                else if (i == 0) style.borderRadius = '4px 0 0 4px';
                else if (i == this.props.options.length - 1) style.borderRadius = '0 4px 4px 0';
                return <div className="flex" key={i}><div
                    style={style}
                    onMouseDown={e => mousedown(e, g)}
                    className={classList.join(" ")} >
                    {g.icon && <Icon icon={{ ...(g.icon || {} as any), color: 'inherit' }}></Icon>}
                    <span>{g.text}</span>
                </div>
                    {i < this.props.options.length - 1 && <div className="flex-fixed" style={{
                        width: 1,
                        display: 'block',
                        backgroundColor: "#eee",
                        height: 20
                    }}></div>}
                </div>
            })}
        </div>
    }
}