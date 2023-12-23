import React, { CSSProperties, ReactNode } from "react";
import { util } from "../../../util/util";

export class CheckBox extends React.Component<{
    checked?: boolean,
    block?: boolean,
    onChange?: (checked: boolean) => void,
    children?: ReactNode,
    readOnly?: boolean, style?: CSSProperties,
}>{
    id = util.guid();
    constructor(props) {
        super(props);
    }
    componentDidUpdate(prevProps: Readonly<{ checked?: boolean; onChange?: (checked: boolean) => void; children?: ReactNode; }>, prevState: Readonly<{}>, snapshot?: any): void {
        if (this.refInput && this.refInput.checked !== this.props.checked) {
            this.refInput.checked = this.props.checked;
        }
    }
    refInput: HTMLInputElement;
    render(): React.ReactNode {
        var id = 'c' + this.id;
        return <div className={"flex " + (this.props.block ? "flex-inline" : "")} style={this.props.style || {}}>
            <input className="checkbox" id={id} readOnly={this.props.readOnly} ref={e => this.refInput = e} type='checkbox' defaultChecked={this.props.checked} onChange={e => this.props.onChange ? this.props.onChange((e.target as HTMLInputElement).checked) : undefined}></input>
            {this.props.children && <label htmlFor={id} className="gap-l-2">{this.props.children}</label>}
        </div>
    }
}