import React, { ReactNode } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { TextSpanArea } from "../../../src/block/view/appear";
import "./style.less";
@url('/shape')
export class Shape extends Block {
    @prop()
    fixedWidth: number = 200;
    @prop()
    fixedHeight: number = 200;
    @prop()
    svgContent: string = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" fill-rule="nonzero"
      d="M16.985 19.501l-.952-5.55 4.033-3.932-5.574-.81L12 4.16l-2.492 5.05-5.574.81 4.033 3.931-.952 5.551L12 16.881l4.985 2.62zM12 19.14l-5.704 2.999A1.08 1.08 0 0 1 4.729 21l1.09-6.351-4.616-4.499a1.08 1.08 0 0 1 .599-1.842l6.377-.927 2.853-5.779a1.08 1.08 0 0 1 1.936 0l2.853 5.78 6.377.926a1.08 1.08 0 0 1 .599 1.842l-4.615 4.499L19.272 21a1.08 1.08 0 0 1-1.568 1.139l-5.704-3z"/>
</svg>`;
}
@view('/shape')
export class ShapeView extends BlockView<Shape>{
    render(): ReactNode {
        return <div className="sy-block-shape" style={this.block.visibleStyle}>
            <div
                style={{ width: this.block.fixedWidth, height: this.block.fixedHeight }}
                dangerouslySetInnerHTML={{ __html: this.block.svgContent }}>
            </div>
            <div className="sy-block-shape-content">
                <TextSpanArea block={this.block}></TextSpanArea>
            </div>
        </div>
    }
}


