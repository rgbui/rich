import React from "react";
import { Kit } from ".";
import { PageLayoutType } from "../layout/declare";
import { HandleView } from "./handle/view";
import { TextInputView } from "./input/view";
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
            <SelectorView selector={this.kit.selector}></SelectorView>
            <TextInputView textInput={this.kit.textInput}></TextInputView>
            <HandleView handle={this.kit.handle}></HandleView>
            <BlockPickerView picker={this.kit.picker}></BlockPickerView>
            {this.kit.page.isBoard && <BoardScale kit={this.props.kit}></BoardScale>}
        </div>
    }
}