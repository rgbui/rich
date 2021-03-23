import { BaseComponent } from "../../base/component";
import React from 'react';
import { url, view } from "../../factory/observable";
import { Content } from "../../base/common/content";
@url('/table/cell')
export class TableCell extends Content {
    rowspan: number = 1;
    colspan: number = 1;
    // getTextAreaEles(partName?: string) {
    //     var part = this.findPart((x, g) => g.type == )
    //     return {
    //         el: part.el,
    //         panel: part.el
    //     }

        
    // }
}
@view('/table/cell')
export class TableCellView extends BaseComponent<TableCell>{
    // render() {
    //     if (this.block.childs.length > 0) return <td
    //         rowSpan={this.block.rowspan} colSpan={this.block.colspan}
    //     >{this.block.childs.map(x => <x.viewComponent key={x.id} block={x}></x.viewComponent>)}</td>
    //     else return <td rowSpan={this.block.rowspan} colSpan={this.block.colspan}><span ref={e => this.block.setPart('default', e, BlockType.text)} dangerouslySetInnerHTML={this.block.htmlContent}></span></td>
    // }
}