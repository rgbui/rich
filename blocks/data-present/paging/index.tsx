import React from "react";
import { Block } from "../../../src/block";
import { BlockAppear, BlockDisplay } from "../../../src/block/enum";
import { url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";

@url('/paging')
export class Paging extends Block {
    appear = BlockAppear.solid;
    display = BlockDisplay.block;
}
@view('/paging')
export class PagingView extends BlockView<Paging>{
    render() {
        return <div className='sy-paging'></div>
    }
}