import { BlockView } from "../../src/block/view";
import React from 'react';
import { url, view } from "../../src/block/factory/observable";
import { Content } from "../../src/block/element/content";
@url('/divider')
export class Divider extends Content {

}
@view('/divider')
export class DividerView extends BlockView<Divider>{
    render() {
        return <div className='sy-block-divider'  style={this.block.visibleStyle}>
            <div className='sy-block-divider-line'></div>
        </div>
    }
}