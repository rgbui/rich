import React from "react";
import { createPortal } from "react-dom";
import { Point } from "../../common/point";
import { Icon } from "../../component/icon";
import { Page } from "../../page";
import { BlockSelectorData } from "./data";

export class BlockSelector extends React.Component<{ page: Page }> {
    private node: HTMLElement;
    constructor(props) {
        super(props);
        this.node = document.body.appendChild(document.createElement('div'));
    }
    get page() {
        return this.props.page;
    }
    renderSelectors() {
        return BlockSelectorData.map(group => {
            return <div className='sy-block-selector-group' key={group.text}>
                <div className='sy-block-selector-group-head'>{group.text}</div>
                <div className='sy-block-selector-group-blocks'>{
                    group.childs.map(child => {
                        return <div className='sy-block-selector-group-block' key={child.url}>
                            <div className='sy-block-selector-group-block-info'>
                                <span>{child.text}</span>
                                <em>{child.description}</em>
                            </div>
                            <label>{child.label}</label>
                        </div>
                    })
                }</div>
            </div>
        })
    }
    render() {
        var style: Record<string, any> = {
            top: this.pos.y,
            left: this.pos.x
        }
        return createPortal(<div>
            {this.visible && <div className='sy-block-selector' style={style}>{this.renderSelectors()}</div>}
        </div>, this.node);
    }
    private visible: boolean = false;
    private pos: Point = new Point(0, 0);
    private command: string = '';
    private selectIndex: number = 0;
    get isVisible() {
        return this.visible;
    }
    open(point: Point) {
        this.pos = point;
        this.visible = true;
        this.forceUpdate();
    }
    onInputFilter(text: string) {
        var cs = text.match(/(\/|、)[^\s]+$/g);
        var command = cs[0];
        if (command) {
            this.command = command;
            this.forceUpdate();
        }
        else {
            this.command = '';
            this.close();
        }
    }
    get selectBlockData() {
        return null;
    }
    close() {
        this.visible = false;
        this.forceUpdate();
    }
    /**
     * 向上选择内容
     */
    keydown() {
        this.selectIndex -= 1;
    }
    /**
     * 向下选择内容
     */
    keyup() {
        this.selectIndex += 1;
    }
    componentWillUnmount(){
        if(this.node)this.node.remove()
    }
}