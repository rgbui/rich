import React from "react";
import { Kit } from ".";
import { BarView } from "./handle/view";
import { TextInputView } from "./input/view";
import { SelectorView } from "./selector";
export class KitView extends React.Component<{ kit: Kit }>{
    get kit() {
        return this.props.kit;
    }
    el: HTMLElement;
    render() {
        return <div className='sy-kit' ref={e => this.el = e}>
            <SelectorView selector={this.kit.selector}></SelectorView>
            <TextInputView textInput={this.kit.textInput}></TextInputView>
            <BarView bar={this.kit.bar}></BarView>
        </div>
    }
}