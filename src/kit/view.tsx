import React from "react";
import { Kit } from ".";
import { HandleView } from "./handle/view";
import { TextInputView } from "./input/view";
import { SelectorView } from "./selector";
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
        </div>
    }
}