

import React from "react";
import { ToolTip } from ".";
import { S } from "../../../i18n/view";
export class Tip extends React.Component<{
    children: React.ReactElement | React.ReactElement[],
    text?:string,
    overlay?: React.ReactNode,
    placement?: 'left' | 'top' | 'bottom' | 'right',
    disabled?:boolean
}>{
    constructor(props) {
        super(props);
    }
    close() {
        this.tip.close();
    }
    private tip: any;
    render() {
        if(this.props.disabled)return <>{this.props.children}</>
        var ov = typeof this.props.text != 'undefined' ? <S>{this.props.text}</S> : this.props.overlay;
        return <ToolTip ref={e => this.tip = e}
            mouseEnterDelay={0.8}
            mouseLeaveDelay={0.1}
            placement={this.props.placement || 'top'}
            overlay={<div className='shy-tooltip-content'>{ov}</div>}
        >{Array.isArray(this.props.children) ? <>{this.props.children}</> : this.props.children}
        </ToolTip>
    }
}

