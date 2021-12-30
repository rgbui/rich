import React from "react";
import ReactDOM, { createPortal } from "react-dom";
import { Selector } from ".";

export class SelectorView extends React.Component<{ selector: Selector }> {
    constructor(props) {
        super(props);
        this.node = document.body.appendChild(document.createElement('div'));
        this.selector.view = this;
    }
    private node: HTMLElement;
    get selector() {
        return this.props.selector;
    }
    componentWillUnmount() {
        if (this.node) this.node.remove()
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
        return createPortal(<div className='shy-kit-selector'>
            {this.selector.visible && <div className='shy-kit-selector-region' style={style}></div>}
        </div>, this.node)
    }
}