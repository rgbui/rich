import React from "react";
import { Icon } from "../../component/icon";
import { SelectorView } from "./render";
export class TextTool extends React.Component<{ selectorView: SelectorView }>{
    get selector() {
        return this.props.selectorView;
    }
    render() {
        return <div>
            <Icon icon='bold:sy'></Icon>
        </div>
    }
}