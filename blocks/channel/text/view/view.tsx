import React from "react";
import { ChannelText } from "..";
import { view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";

@view('/channel/text')
export class ChannelTextView extends BlockView<ChannelText>{
    renderHead() {
        return <div className="sy-channel-text-head"></div>
    }
    renderContent() {
        return <div className="sy-channel-text-content">

        </div>
    }
    renderInput() {
        return <div className="sy-channel-text-input">

        </div>
    }
    render() {
        return <div className='sy-channel-text' style={this.block.visibleStyle}>
            {this.renderHead()}
            {this.renderContent()}
            {this.renderInput()}
        </div>
    }
}