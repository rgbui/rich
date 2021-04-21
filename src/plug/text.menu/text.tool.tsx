import React from "react";
import { createPortal } from "react-dom";
import { Point } from "../../common/point";
import { Icon } from "../../component/icon";
import { Page } from "../../page";
import Equation from "../../assert/svg/equation.svg";
import Mention from "../../assert/svg/mention.svg";

export class TextTool extends React.Component<{ page: Page }>{
    private node: HTMLElement;
    constructor(props) {
        super(props);
        this.node = document.body.appendChild(document.createElement('div'));
    }
    open(event: MouseEvent) {
        this.point = Point.from(event);
        this.visible = true;
        console.log('xxx');
        this.forceUpdate();
    }
    close() {
        this.visible = false;
        this.forceUpdate();
    }
    get isVisible() {
        return this.visible;
    }
    private visible: boolean = false;
    private point: Point = new Point(0, 0);
    render() {
        var style: Record<string, any> = {};
        style.top = this.point.y;
        style.left = this.point.x;
        return createPortal(
            <div>
                {this.visible == true && <div className='sy-tool-text-menu' style={style}>
                    <div className='sy-tool-text-menu-item sy-tool-text-menu-devide'><span>Text</span><Icon icon='arrow-down:sy'></Icon></div>
                    <div className='sy-tool-text-menu-item sy-tool-text-menu-devide'><Icon icon='link:sy'></Icon><Icon icon='arrow-down:sy'></Icon></div>
                    <div className='sy-tool-text-menu-item sy-tool-text-menu-devide'><Icon icon='comment:sy'></Icon></div>
                    <div className='sy-tool-text-menu-item'><Icon icon='bold:sy'></Icon></div>
                    <div className='sy-tool-text-menu-item'><Icon icon='italic:sy'></Icon></div>
                    <div className='sy-tool-text-menu-item'><Icon icon='underline:sy'></Icon></div>
                    <div className='sy-tool-text-menu-item'><Icon icon='delete-line:sy'></Icon></div>
                    <div className='sy-tool-text-menu-item'><Icon icon='code:sy'></Icon></div>
                    <div className='sy-tool-text-menu-item'><Icon icon={Equation}></Icon></div>
                    <div className='sy-tool-text-menu-item'><span>A</span><Icon icon='arrow-down:sy'></Icon></div>
                    <div className='sy-tool-text-menu-item'><Icon icon={Mention}></Icon></div>
                </div>}
            </div>,
            this.node);
    }
    componentWillUnmount() {
        this.node.remove();
    }
}