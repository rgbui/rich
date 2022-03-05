import React from "react";
import { ChannelText } from "..";
import { RichTextInput } from "../../../../component/view/rich.input";
import { view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { renderChannelTextContent } from "./content";
@view('/channel/text')
export class ChannelTextView extends BlockView<ChannelText>{
    renderHead() {
        return <div className="sy-channel-text-head"></div>
    }
    renderContent() {
        return <div className="sy-channel-text-content">
            {renderChannelTextContent(this.block)}
        </div>
    }
    renderInput() {
        return <div className="sy-channel-text-input">
            <RichTextInput popOpen={e => this.popOpen(e)} onInput={e => this.onInput(e)} ></RichTextInput>
        </div>
    }
    popOpen(cs: { char: string, span: HTMLElement }) {

    }
    onInput(data: { files?: File[], content?: string }) {

    }
    render() {
        return <div className='sy-channel-text' style={this.block.visibleStyle}>
            {this.renderHead()}
            {this.renderContent()}
            {this.renderInput()}
        </div>
    }
}