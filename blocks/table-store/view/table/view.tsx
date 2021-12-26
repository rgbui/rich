import React from "react"
import { TableStore } from "."
import { Icon } from "../../../../component/view/icon"
import { view } from "../../../../src/block/factory/observable"
import { BlockView } from "../../../../src/block/view"
import { ChildsArea } from "../../../../src/block/view/appear"
import Plus from "../../../../src/assert/svg/plus.svg";

@view('/table/store')
export class TableStoreView extends BlockView<TableStore>{
    renderHead() {
        if (this.block.schema) return <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
        else return <div></div>
    }
    renderBody() {
        if (this.block.data && this.block.isLoadData)
            return <div className='sy-tablestore-body'><ChildsArea childs={this.block.blocks.rows}></ChildsArea>
            </div>
        else if (this.block.data && !this.block.isLoadData)
            return <div className='sy-tablestore-body'><ChildsArea childs={this.block.blocks.rows}></ChildsArea>
            </div>
        else return <div></div>
    }
    async didMount() {
        await this.block.loadSchema();
        await this.block.createHeads();
        this.forceUpdate()
        await this.block.loadData();
        await this.block.createRows();
        this.forceUpdate();
    }
    render() {
        return <div className='sy-tablestore'>
            <div className='sy-tablestore-col-resize'></div>
            <div className='sy-tablestore-content'>
                {this.renderHead()}
                {this.renderBody()}
            </div>
            <div onMouseDown={e => this.block.onAddOpenForm(e)} className="sy-tablestore-add" style={{ width: this.block.fields.sum(s => s.width) + 100 }}>
                <Icon  size={12} icon={Plus}></Icon><span>新增</span>
            </div>
        </div>
    }
}