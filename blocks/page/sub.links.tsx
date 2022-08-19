import React from "react";
import { Block } from "../../src/block";
import { url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
@url('/sub/links')
export class SubLinks extends Block {

}
@view('/sub/links')
export class SubLinksView extends BlockView<SubLinks>{
    render() {
        return <div className="sy-block-sub-links">

        </div>
    }
}