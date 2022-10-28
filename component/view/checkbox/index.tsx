import React, { ReactNode } from "react";

import "./style.less"

export class CheckBox extends React.Component<{

    checked?: boolean,
    onChange?: (checked: boolean) => void,
    children?: ReactNode

}>{
    constructor(props) {
        super(props);
    }
    render(): React.ReactNode {
        return <div className="shy-checkbox">
            <input type='checkbox' defaultChecked={this.props.checked} onChange={e => this.props.onChange((e.target as HTMLInputElement).checked)}></input>
            <span className="shy-checkbox-content">{this.props.children}</span>
        </div>
    }
}