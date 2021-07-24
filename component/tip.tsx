
import Tooltip from "rc-tooltip";
import React from "react";
import { Sp } from "../i18n";
import { LangID } from "../i18n/declare";
import "../../node_modules/rc-tooltip/assets/bootstrap_white.css";
export class Tip extends React.Component<{
    children: React.ReactElement | React.ReactElement[],
    id?: LangID,
    overlay?: React.ReactNode,
    placement?: 'left' | 'top' | 'bottom' | 'right'
}>{
    constructor(props) {
        super(props);
    }
    close() {
        this.tip.close();
    }
    private tip: any;
    render() {
        var ov = typeof this.props.id != 'undefined' ? <Sp id={this.props.id}></Sp> : this.props.overlay;
        return <Tooltip overlayClassName='sy-tooltip' ref={e => this.tip = e}
            mouseEnterDelay={0.8}
            mouseLeaveDelay={0.1}
            placement={this.props.placement || 'top'}
            trigger={['hover']}
            overlayInnerStyle={{ minHeight: 'auto' }}
            overlay={<div className='sy-tooltip-content'>{ov}</div>}
        >{Array.isArray(this.props.children) ? <>{this.props.children}</> : this.props.children}
        </Tooltip>
    }
}

