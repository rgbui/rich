import { Block } from "../../base";
import { BaseComponent } from "../../base/component";
import React from "react";
import { url, view } from "../../factory/observable";
import "./style.less";
import { BlockAppear, BlockDisplay } from "../../base/enum";
@url('/table')
export class Table extends Block {
    appear = BlockAppear.layout;
    display = BlockDisplay.block;
}
@view('/table')
export class TableView extends BaseComponent<Table>{
    render() {
        return <table className='sy-block-table'><tbody>{this.block.childs.map(x =>
            <x.viewComponent key={x.id} block={x}></x.viewComponent>)}</tbody></table>
    }
}