import React, { CSSProperties } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ChildsArea } from "../../../src/block/view/appear";
import { Matrix } from "../../../src/common/matrix";
import { Rect } from "../../../src/common/vector/point";
import "./style.less";

@url('/board')
export class Board extends Block {
    @prop()
    viewHeight: number = 300;
    get childsOffsetMatrix(): Matrix {
        var matrix = new Matrix();
        if (this.el) {
            var root = this.page.root;
            var rect = Rect.fromEle(root);
            var currentRect = Rect.fromEle(this.el);
            var r = currentRect.leftTop.relative(rect.leftTop);
            matrix.transform(r.x, r.y);
        }
        return matrix;
    }
}
@view('/board')
export class BoardView extends BlockView<Board>{
    render() {
        var style: CSSProperties = {};
        style.height = this.block.viewHeight;
        return <div className="sy-board" style={this.block.visibleStyle}>
            <div className="sy-board-content" style={style}><ChildsArea childs={this.block.childs}></ChildsArea></div>
        </div>
    }
}

