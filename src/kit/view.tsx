import React from "react";
import { Kit } from ".";
import { Collaboration } from "./collaboration";
import { BoardBlockHover } from "./connect/block.hover";
import { HandleView } from "./handle/view";
import { BlockPickerView } from "./picker/view";
import { BoardScale } from "./scale";
import { SelectorView } from "./anchor/selector/view";
import { BoardSelector } from "./board.selector";

export class KitView extends React.Component<{ kit: Kit }>{
    constructor(props) {
        super(props);
        this.kit.view = this;
    }
    get kit() {
        return this.props.kit;
    }
    el: HTMLElement;
    render() {
        return <div className='shy-kit' ref={e => this.el = e}>
            <div className="shy-kit-tool"></div>
            <BlockPickerView picker={this.kit.picker}></BlockPickerView>
            <SelectorView selector={this.kit.anchorCursor.selector}></SelectorView>
            <HandleView handle={this.kit.handle}></HandleView>
            <BoardScale kit={this.props.kit}></BoardScale>
            <Collaboration kit={this.props.kit} ref={e => this.kit.collaboration = e}></Collaboration>
            <BoardBlockHover ref={e => this.kit.boardBlockHover = e} kit={this.kit}></BoardBlockHover>
            <BoardSelector ref={e => this.kit.boardSelector = e} kit={this.kit}></BoardSelector>
        </div>
    }
    get toolEl() {
        return this.el.querySelector('.shy-kit-tool') as HTMLElement;
    }
}