import React, { CSSProperties } from "react";
import { IconArguments } from "../../../extensions/icon/declare";
import { ChevronDownSvg } from "../../svgs";
import { Icon } from "../icon";
import "./style.less";

export class Select extends React.Component<{
    children?: JSX.Element | string | React.ReactNode,
    disabled?: boolean,
    value?: any,
    options: { text?: string, icon?: string | SvgrComponent | JSX.Element | IconArguments, value: any }[],
    onChange?: (value: any) => void,
    style?: CSSProperties,
    dropStyle?: CSSProperties,
    dropAlign?: 'left' | 'right' | 'center',
    optionAlign?: 'left' | 'right' | 'center',
    border?: boolean,
    placeholder?: string
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
            if (typeof props.onChange == 'function')
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
        else if (this.props.dropAlign == 'center') {
            dropStyle = { left: '50%', transform: 'translate(-50%,0px)' };
        }
        if (this.props.dropStyle) Object.assign(dropStyle, this.props.dropStyle)
        var op = props.options.find(g => g.value == props.value);
        var optionStyle: CSSProperties = { justifyContent: 'flex-start' }
        if (props.optionAlign == 'center') optionStyle.justifyContent = 'center';
        else if (props.optionAlign == 'right') optionStyle.justifyContent = 'flex-end';
        return <div className={'shy-select' + (props.border ? " shy-select-border" : "")} style={this.props.style || {}} ref={e => this.el = e}>
            <div className='shy-select-selection flex' onClick={e => props.disabled ? undefined : (setToggle())}>
                {props.children && <>{props.children}<Icon size={14} icon={ChevronDownSvg}></Icon></>}
                {!props.children && <>{op?.icon &&<Icon size={18} icon={op.icon}></Icon>}{op?.text||props.placeholder}<Icon size={14} icon={ChevronDownSvg}></Icon></>}
            </div>
            {this.toggle && <div className='shy-select-drop' style={dropStyle} >
                {props.options.map((op, index) => {
                    return <a key={index} style={optionStyle} className={props.value == op.value ? "hover" : ""} onClick={e => click(op)}>
                        {op.icon && <Icon icon={op.icon}></Icon>}
                        <span>{op.text}</span>
                    </a>
                })}
            </div>}
        </div>
    }
}


