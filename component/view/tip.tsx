

import React from "react";
import { Sp } from "../../i18n/view";
import { LangID } from "../../i18n/declare";
import { ToolTip } from "./tooltip";
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
        return <ToolTip ref={e => this.tip = e}
            mouseEnterDelay={0.8}
            mouseLeaveDelay={0.1}
            placement={this.props.placement || 'top'}
            overlay={<div className='shy-tooltip-content'>{ov}</div>}
        >{Array.isArray(this.props.children) ? <>{this.props.children}</> : this.props.children}
        </ToolTip>
    }
}

