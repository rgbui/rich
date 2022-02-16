import React, { CSSProperties } from "react";
import SvgDown from "../../src/assert/svg/chevronDown.svg";
export class Select extends React.Component<{
    children?: JSX.Element | string | React.ReactNode,
    disabled?: boolean,
    value?: any,
    options: { text: string, value: any }[],
    onChange?: (value: any) => void,
    style?: CSSProperties,
    dropAlign?: 'left' | 'right',
    border?: boolean
}>{
    private toggle: boolean = false;
    mousedown(event: MouseEvent) {
        if (this.toggle == false) return;
        var ele = event.target as HTMLElement;
        if (this.el && this.el.contains(ele)) return;
        this.toggle = false;
        this.forceUpdate();
    }
    private _mousedown: (event: MouseEvent) => void;
    componentDidMount() {
        document.addEventListener('mousedown', this._mousedown = this.mousedown.bind(this), true)
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this._mousedown, true)
    }
    el: HTMLElement;
    render() {
        var props = this.props;
        var self = this;
        function click(item) {
            self.toggle = false;
            self.forceUpdate();
            props.onChange(item.value);
        }
        function setToggle() {
            self.toggle = !self.toggle;
            self.forceUpdate()
        }
        var dropStyle: CSSProperties = { left: 0 };
        if (this.props.dropAlign == 'right') {
            dropStyle = { right: 0 };
        }
        var op = props.options.find(g => g.value == props.value);
        return <div className={'shy-select' + (props.border ? " shy-select-border" : "")} style={this.props.style || {}} ref={e => this.el = e}>
            <div className='shy-select-selection' onClick={e => props.disabled ? undefined : (setToggle())}>
                {props.children && <>{props.children}<SvgDown></SvgDown></>}
                {!props.children && <><span>{op?.text || props.value}</span><SvgDown></SvgDown></>}
                {/*<input defaultValue={props.options.find(g => g.value == props.value)?.text} /> */}
            </div>
            {this.toggle && <div className='shy-select-drop' style={dropStyle} >
                {props.options.map((op, index) => {
                    return <a key={index} className={props.value == op.value ? "hover" : ""} onClick={e => click(op)}><span>{op.text}</span></a>
                })}
            </div>}
        </div>
    }
}


