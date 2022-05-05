import React from "react";
import { Kit } from ".";
import { BoardBlockHover } from "./connect/block.hover";
import { HandleView } from "./handle/view";
import { BlockPickerView } from "./picker/view";
import { BoardScale } from "./scale";
import { SelectorView } from "./selector/view";

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
            <BlockPickerView picker={this.kit.picker}></BlockPickerView>
            <SelectorView selector={this.kit.selector}></SelectorView>
            <HandleView handle={this.kit.handle}></HandleView>
            <BoardScale kit={this.props.kit}></BoardScale>
            <BoardBlockHover ref={e => this.kit.boardBlockHover = e} kit={this.kit}></BoardBlockHover>
        </div>
    }
}