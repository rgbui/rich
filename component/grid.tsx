import React, { CSSProperties } from "react";

export class Row extends React.Component<{
    valign?: 'top' | 'middle' | 'bottom',
    align?: 'start' | 'end' | 'center',
    style?: CSSProperties,
    children?: React.ReactNode,
    className?: string[] | string
}>{
    render() {
        var cns: string[] = ['shy-row'];
        if (this.props.className) {
            if (Array.isArray(this.props.className)) cns.addRange(this.props.className)
            else cns.push(this.props.className)
        }
        var style: CSSProperties = {
            justifyContent: 'flex-start',
            alignItems: 'flex-start'
        };
        if (this.props.align == 'center') style.justifyContent = 'center'
        else if (this.props.align == 'end') style.justifyContent = 'flex-end'
        if (this.props.valign == 'middle') style.alignItems = 'center'
        else if (this.props.valign == 'bottom') style.alignItems = 'flex-end'
        return <div className={cns.join(" ")} style={style}>{this.props.children}</div>
    }
}
/**
 * @param span 0~24
 */
export class Col extends React.Component<{
    span?: number,
    children?: React.ReactNode,
    valign?: 'top' | 'middle' | 'bottom',
    align?: 'start' | 'end' | 'center',
}> {
    render() {
        var sp = this.props.span;
        if (typeof sp == 'undefined') sp = 24;
        var style: CSSProperties = {
            flexShrink: 0,
            width: (sp * (100 / 24.0)) + '%',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            display: 'inline-flex'
        }
        if (this.props.align == 'center') style.justifyContent = 'center'
        else if (this.props.align == 'end') style.justifyContent = 'flex-end'
        if (this.props.valign == 'middle') style.alignItems = 'center'
        else if (this.props.valign == 'bottom') style.alignItems = 'flex-end'
        return <div className='shy-col' style={style}>{this.props.children}</div>
    }
}

export class Space extends React.Component<{
    align?: 'start' | 'end' | 'center',
    direction?: 'x' | 'y'
    gap?: number,
    children?: React.ReactNode,
    style?: CSSProperties
}>{
    render() {
        var style: CSSProperties = {
            display: "flex",
            alignItems: 'center',
            justifyContent: 'flex-start',
            ...(this.props.style || {})
        };
        if (this.props.align == 'center') style.justifyContent = 'center'
        else if (this.props.align == 'end') style.justifyContent = 'flex-end';
        if (this.props.direction == 'y') style.flexDirection = 'column';
        var itemStyle: CSSProperties = {};
        if (this.props.direction == 'y') itemStyle.marginBottom = this.props.gap || 10;
        else {
            if (this.props.align == 'end') itemStyle.marginLeft = this.props.gap || 10;
            else if (this.props.align == 'center') {
                itemStyle.marginLeft = (this.props.gap || 10) / 2;
                itemStyle.marginRight = (this.props.gap || 10) / 2;
            }
            else itemStyle.marginRight = this.props.gap || 10;
        }
        return <div className='shy-space' style={style}>
            {React.Children.map(this.props.children, (element, index) => {
                return <div className='shy-space-item' style={itemStyle} key={index}>{element}</div>
            })}
        </div>
    }
}

export class Divider extends React.Component<{
    align?: 'left' | 'center' | 'right'
    children?: React.ReactNode
}>{
    render() {
        var style: CSSProperties = {};
        return <div style={style} className='shy-divider'>
            <div className='shy-divider-line'></div>
            {this.props.children && <div className='shy-divider-title'>{this.props.children}</div>}
        </div>
    }
}