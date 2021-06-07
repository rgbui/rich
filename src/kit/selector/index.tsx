import React from "react";
import ReactDOM, { createPortal } from "react-dom";
import { Kit } from "..";
import { Point } from "../../common/point";

export class Selector {
    kit: Kit;
    view: SelectorView;
    constructor(kit: Kit) {
        this.kit = kit;
    }
    private visible: boolean = false;
    private start: Point;
    private current: Point;
    setStart(point: Point) {
        this.start = point;
    }
    setMove(point: Point) {
        this.current = point;
        this.visible = true; this.view.forceUpdate();
    }
    close() {
        this.visible = false;
        this.view.forceUpdate();
    }
}
export class SelectorView extends React.Component<{ selector: Selector }> {
    constructor(props) {
        super(props);
        this.node = document.body.appendChild(document.createElement('div'));
        this.selector.view=this;
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
        return createPortal(<div className='sy-kit-selector'></div>, this.node)
    }
}