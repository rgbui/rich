
import React from "react";
import { Block } from "../../src/block";
import { url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";

@url('/ref/links')
export class RefLinks extends Block {

}
@view('/ref/links')
export class RefLinksView extends BlockView<RefLinks>{
    render() {
        return <div className="sy-block-ref-links">

        </div>
    }
}