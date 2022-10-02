import React, { CSSProperties } from "react";
import { Icon } from "../icon";
import "./style.less";
export class Button extends React.Component<{
    children?: JSX.Element | string | React.ReactNode,
    icon?: string | SvgrComponent | JSX.Element,
    iconSize?: number,
    disabled?: boolean,
    onClick?: (event: React.MouseEvent, button?: Button) => void,
    block?: boolean,
    ghost?: boolean,
    link?: boolean,
    style?: CSSProperties,
    size?: 'normal' | 'medium' | 'larger' | 'small',
    className?: string
}>{
    private _loading: boolean;
    set loading(loading: boolean) {
        this._loading = loading;
        this.forceUpdate()
    }
    private _disabled: boolean;
    set disabled(disabled: boolean) {
        this._disabled = disabled;
        this.forceUpdate()
    }
    render() {
        var props = this.props;
        var self = this;
        function renderLoading() {
            if (self._loading == true) return <svg
                viewBox="0 0 1024 1024"
                className="shy-button-loading"
                focusable="false"
                data-icon="loading"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
            >
                <path
                    d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"
                ></path>
            </svg>
            if (props.icon) return <Icon size={props.iconSize || 16} icon={props.icon}></Icon>
        }
        var btn = <button style={this.props.style || {}}
            className={'shy-button' + (props.className ? " " + props.className : "") + (props.link ? " shy-button-link" : "") + (props.ghost ? " shy-button-ghost" : "") + (this.props.size ? " shy-button-" + this.props.size : "")}
            disabled={props.disabled || this._disabled ? props.disabled : false}
            onClick={e => props.onClick && !this._loading ? props.onClick(e, this) : undefined}
        >{renderLoading()}{props.children}</button>;
        if (props.block) return <div style={this.props.style || {}} className='shy-button-block'>{btn}</div>
        else return btn
    }
}

