
import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { DataGridView } from "../base/table";
import "./style.less";

@url('/data-grid/gallery')
export class TableStoreGallery extends DataGridView {

}
@view('/data-grid/gallery')
export class TableStoreGalleryView extends BlockView<TableStoreGallery>{
    renderRows() {
        var childs = this.block.childs;
        var rowCount = Math.ceil(childs.length / 3);
        var eles: JSX.Element[] = [];
        for (let i = 0; i < rowCount; i++) {
            var cs = [childs[i * 3 + 0]];
            if (i * 3 + 1 < this.block.childs.length) cs.push(childs[i * 3 + 1])
            if (i * 3 + 2 < this.block.childs.length) cs.push(childs[i * 3 + 2]);
            eles.push(<div className='sy-data-grid-gallery-row' key={i}><ChildsArea childs={cs}></ChildsArea></div>)
        }
        return eles;
    }
    render() {
        return <div className='sy-data-grid-gallery'>
            <div className="sy-data-grid-gallery-head" style={{ minHeight: 24 }}></div>
            {this.renderRows()}
        </div>
    }
}