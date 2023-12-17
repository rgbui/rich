import React, { CSSProperties } from "react";
import { Icon, IconValueType } from "../icon";
import "./style.less";
export class Button extends React.Component<{
    children?: JSX.Element | string | React.ReactNode,
    icon?: IconValueType,
    iconSize?: number,
    disabled?: boolean,
    onClick?: (event: React.MouseEvent, button?: Button) => void,
    onMouseDown?: (event: React.MouseEvent, button?: Button) => void,
    block?: boolean,
    ghost?: boolean,
    dark?:boolean,
    link?: boolean,
    danger?: boolean,
    style?: CSSProperties,
    loading?: boolean,
    size?: 'normal' | 'medium' | 'larger' | 'small',
    className?: string,
    tag?: 'button'
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
            if (self._loading == true || self.props.loading) return <svg
                viewBox="0 0 1024 1024"
                className="shy-button-loading gap-r-5"
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
        var classList: string[] = ['shy-button'];
        if (props.className) classList.push(props.className)
        if (props.link) classList.push('shy-button-link')
        if (props.ghost) classList.push('shy-button-ghost')
        if(props.dark) classList.push('shy-button-dark')
        if (this.props.size) classList.push('shy-button-' + this.props.size)
        if (props.danger) classList.push('shy-button-danger')
        if (props.disabled || this._disabled) classList.push('shy-button-disabled')
        var style = this.props.style || {};
        if (props.block) {
            style.display = 'flex';
            classList.push('flex-center');
        }
        else {
            style.display = 'inline-flex';
            classList.push('flex-center');
        }
        var btn = <span style={style}
            className={classList.join(' ')}
            onClick={e => props.onClick && props.disabled !== true && !(this._loading || props.loading) ? props.onClick(e, this) : undefined}
            onMouseDown={e => props.onMouseDown && props.disabled !== true && !(this._loading || props.loading) ? props.onMouseDown(e, this) : undefined}
        >{renderLoading()}{props.children}</span>;
        if (props.tag == 'button') btn = <button style={style}
            className={classList.join(' ')}
            onClick={e => props.onClick && props.disabled !== true && !(this._loading || props.loading) ? props.onClick(e, this) : undefined}
            onMouseDown={e => props.onMouseDown && props.disabled !== true && !(this._loading || props.loading) ? props.onMouseDown(e, this) : undefined}
        >{renderLoading()}{props.children}</button>;
        if (props.block) return <div className='shy-button-block'>{btn}</div>
        else return btn
    }
}

