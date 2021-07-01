
import Tooltip from "rc-tooltip";
import React from "react";
import { Sp } from "../i18n";
import { LangID } from "../i18n/declare";

export class Tip extends React.Component<{ children: React.ReactElement, id?: LangID, overlay?: React.ReactNode }>{
    constructor(props) {
        super(props);
    }
    close() {
        this.tip.close();
    }
    private tip: any;
    render() {
        var ov = typeof this.props.id != 'undefined' ? <Sp id={this.props.id}></Sp> : this.props.overlay;
        return <Tooltip ref={e => this.tip = e} mouseEnterDelay={0.8}
            mouseLeaveDelay={0.1}
            placement="left"
            trigger={['hover']}
            overlay={<div className='sy-tooltip-content'>{ov}</div>}
        >{this.props.children}
        </Tooltip>
    }
}

