import React, { CSSProperties } from "react";

export class Row extends React.Component<{
    valign?: 'top' | 'middle' | 'bottom',
    align?: 'start' | 'end' | 'center',
    style?: CSSProperties,
    children?: React.ReactNode,
    className?: string[] | string,
    onMouseDown?: (event: React.MouseEvent) => void,
}>{
    render() {
        var cns: string[] = ['shy-row'];
        if (this.props.className) {
            if (Array.isArray(this.props.className)) cns.addRange(this.props.className)
            else cns.push(this.props.className)
        }
        var style: CSSProperties = {
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            ...(this.props.style || {})
        };
        if (this.props.align == 'center') style.justifyContent = 'center'
        else if (this.props.align == 'end') style.justifyContent = 'flex-end'
        if (this.props.valign == 'middle') style.alignItems = 'center'
        else if (this.props.valign == 'bottom') style.alignItems = 'flex-end'
        return <div onMouseDown={e => this.props.onMouseDown ? this.props.onMouseDown(e) : undefined} className={cns.join(" ")} style={style}>{this.props.children}</div>
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
    style?: CSSProperties
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
        if (this.props.style) style = Object.assign(style, this.props.style);
        return <div className='shy-col' style={style}>{this.props.children}</div>
    }
}

export class Space extends React.Component<{
    align?: 'start' | 'end' | 'center',
    valign?: 'start' | 'end' | 'center',
    direction?: 'x' | 'y'
    gap?: number,
    children?: React.ReactNode,
    style?: CSSProperties,
    onMousedown?: (event: React.MouseEvent) => void
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
        if (this.props.valign == 'start') style.alignItems = 'flex-start';
        else if (this.props.valign == 'end') style.alignItems = 'flex-end';

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
        return <div onMouseDown={e => this.props.onMousedown ? this.props.onMousedown(e) : undefined} className='shy-space' style={style}>
            {React.Children.map(this.props.children, (element, index) => {
                return <div className='shy-space-item' style={itemStyle} key={index}>{element}</div>
            })}
        </div>
    }
}

export class Divider extends React.Component<{
    align?: 'left' | 'center' | 'right'
    children?: React.ReactNode,
    style?: CSSProperties,
    hidden?: boolean
}>{
    render() {
        var style: CSSProperties = this.props.style || {};
        var align = this.props.align || 'left';
        if (this.props.hidden) style.visibility = 'hidden';
        return <div style={style} className='shy-divider'>
            <div className='shy-divider-line'></div>
            {this.props.children && <div className={'shy-divider-title' + " " + align}>
                <span>{this.props.children}</span>
            </div>}
        </div>
    }
}

export class Dialoug extends React.Component<{
    head?: React.ReactNode,
    children?: React.ReactNode,
    footer?: React.ReactNode,
    style?: CSSProperties,
    className?: string[] | string,
    contentClassName?: string[] | string,
}>{
    render(): React.ReactNode {
        var classList: string[] = ['shy-dialoug'];
        if (this.props.className) {
            var cs = Array.isArray(this.props.className) ? this.props.className : [this.props.className];
            cs.each(c => {
                if (!classList.includes(c)) classList.push(c)
            })
        }
        var contentClassList: string[] = ['shy-dialoug-content'];
        if (Array.isArray(this.props.contentClassName)) {
            this.props.contentClassName.forEach(c => {
                contentClassList.push(c);
            })
        }
        return <div className={classList.join(" ")} style={this.props.style || {}}>
            {this.props.head && <div className="shy-dialoug-head">{this.props.head}</div>}
            <div style={{
                paddingTop: this.props.head ? undefined : 0,
                paddingBottom: this.props.footer ? undefined : 0
            }} className={contentClassList.join(' ')}>
                {this.props.children}
            </div>
            {this.props.footer && <div className="shy-dialoug-footer">{this.props.footer}</div>}
        </div>
    }
}



export class Line extends React.Component<{ className?: string | (string[]), height?: number, gap?: number }>{
    render(): React.ReactNode {
        var style: CSSProperties = {
            display: 'inline-block',
            width: 1,
            margin: '0px ' + (this.props.gap || 5) + 'px',
            height: this.props.height || 20,
            backgroundColor: 'rgba(55,53,47,0.09)'
        }
        var classList: string[] = [];
        if (Array.isArray(this.props.className)) classList = classList.concat(this.props.className);
        else if (typeof this.props.className == 'string') classList.push(this.props.className);
        return <span style={style} className={classList.join(" ")}>
        </span>
    }
}