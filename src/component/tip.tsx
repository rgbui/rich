
import Tooltip from "rc-tooltip";
import React from "react";
import { Sp } from "../i18n";

export class Tip extends React.Component<{ children: React.ReactElement, id?: string, overlay?: React.ReactNode }>{
    constructor(props) {
        super(props);
    }
    close() {
        this.tip.close();
    }
    private tip: any;
    render() {
        var ov = this.props.id ? <Sp id={this.props.id}></Sp> : this.props.overlay;
        return <Tooltip ref={e => this.tip = e} mouseEnterDelay={0.8}
            mouseLeaveDelay={0.1}
            placement="left"
            trigger={['hover']}
            overlay={<div className='sy-tooltip-content'>{ov}</div>}
        >{this.props.children}
        </Tooltip>
    }
}

