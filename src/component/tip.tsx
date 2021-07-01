
import Tooltip from "rc-tooltip";
import React from "react";

export class Tip extends React.Component<{ children: React.ReactElement, overlay: React.ReactNode }>{
    constructor(props) {
        super(props);
    }
    close() {
        this.tip.close();
    }
    private tip: any;
    render() {
        return <Tooltip ref={e => this.tip = e} mouseEnterDelay={0.8}
            mouseLeaveDelay={0.1}
            placement="left"
            trigger={['hover']}
            overlay={this.props.overlay}
        >{this.props.children}
        </Tooltip>
    }
}

