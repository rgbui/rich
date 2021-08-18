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
    span: number,
    children?: React.ReactNode
}> {
    render() {
        var style: CSSProperties = {
            flexShrink: 0,
            width: this.props.span > 0 ? (100 / 24.0) + '%' : '0px'
        }
        return <div className='shy-col' style={style}>{this.props.children}</div>
    }
}

export class Space extends React.Component<{
    align: 'start' | 'end' | 'center',
    direction: 'x' | 'y'
    gap?: number,
    children?: React.ReactNode
}>{
    render() {
        return <div className='shy-space'>
            {React.Children.map(this.props.children, (element, index) => {
                <div className='shy-space-item' key={index}>{element}</div>
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
            <div className='shy-divider-title'>{this.props.children}</div>
        </div>
    }
}