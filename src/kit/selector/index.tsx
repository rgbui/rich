import React from "react";
import ReactDOM, { createPortal } from "react-dom";
import { Kit } from "..";
import { Point, Rect } from "../../common/point";

export class Selector {
    kit: Kit;
    view: SelectorView;
    constructor(kit: Kit) {
        this.kit = kit;
    }
    public visible: boolean = false;
    private start: Point;
    private current: Point;
    setStart(point: Point) {
        this.start = point;
    }
    setMove(point: Point) {
        this.current = point;
        this.visible = true;
        this.view.forceUpdate();
    }
    close() {
        this.visible = false;
        this.view.forceUpdate();
    }
    get rect() {
        return new Rect(this.start, this.current)
    }
}
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