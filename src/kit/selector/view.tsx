import React from "react";
import ReactDOM from "react-dom";
import { Selector } from ".";

export class SelectorView extends React.Component<{ selector: Selector }> {
    constructor(props) {
        super(props);
        this.selector.view = this;
    }
    get selector() {
        return this.props.selector;
    }
    el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
    }
    render() {
        var style: Record<string, any> = {};
        if (this.selector.visible == true) {
            var rect = this.selector.rect;
            style.width = rect.width;
            style.height = rect.height;
            style.top = rect.top;
            style.left = rect.left;
        }
        return <div className='shy-kit-selector'>
            {this.selector.visible && <div className='shy-kit-selector-region' style={style}></div>}
        </div>
    }
}