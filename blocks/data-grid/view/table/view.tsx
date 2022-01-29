import React from "react"
import { TableStore } from "."
import { Icon } from "../../../../component/view/icon"
import { view } from "../../../../src/block/factory/observable"
import { BlockView } from "../../../../src/block/view"
import { ChildsArea } from "../../../../src/block/view/appear"
import Plus from "../../../../src/assert/svg/plus.svg";
import { getTypeSvg } from "../../schema/util"
import { Loading } from "../../../../component/view/loading"

@view('/data-grid/table')
export class TableStoreView extends BlockView<TableStore>{
    renderHead() {
        return <div className="sy-data-grid-table">
            {this.block.fields.map(f => {
                return <div key={f.field.name}>
                    <Icon icon={getTypeSvg(f.field.type)} size='none'></Icon>
                    <label>{f.text || f.field.text}</label>
                    <Icon icon='elipsis:sy'></Icon>
                </div>
            })}
            <div className='sy-data-grid-head-th sy-data-grid-head-th-plus'
                style={{ width: 100 }} onClick={e => this.block.onAddField(e)}>
                <Icon icon={Plus}></Icon>
            </div>
        </div>
    }
    renderBody() {
        if (this.block.data && this.block.isLoadData) {
            return <div className='sy-data-grid-body'>
                <ChildsArea childs={this.block.childs}></ChildsArea>
            </div>
        }
        else return <div><Loading></Loading></div>
    }
    render() {
        var self = this;
        return <div className="sy-data-grid">
            {this.renderHead()}
            {this.renderBody()}
            <div onMouseDown={e => self.block.onAddRow({}, undefined, 'after')} className="sy-data-grid-add" style={{ width: this.block.fields.sum(s => s.colWidth) + 100 }}>
                <Icon size={12} icon={Plus}></Icon><span>新增</span>
            </div>
        </div>
    }
}