import React from "react";
import { Kit } from ".";
import { BoardBlockHover } from "./connect/block.hover";
import { HandleView } from "./handle/view";
import { TextInputView } from "./input/view";
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
            <SelectorView selector={this.kit.selector}></SelectorView>
            <TextInputView textInput={this.kit.textInput}></TextInputView>
            <HandleView handle={this.kit.handle}></HandleView>
            {this.kit.page.isBoard && <BoardScale kit={this.props.kit}></BoardScale>}
            <BoardBlockHover ref={e => this.kit.boardBlockHover = e} kit={this.kit}></BoardBlockHover>
        </div>
    }
}