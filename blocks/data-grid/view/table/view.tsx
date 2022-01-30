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
        return <div className="sy-dg-table-head">
            {this.block.fields.map(f => {
                return <div className="sy-dg-table-head-th"
                    style={{ width: f.colWidth || 120 }}
                    key={f.field.name}>
                    <div className={'sy-dg-table-head-th-icon'} ><Icon icon={getTypeSvg(f.field.type)} size='none'></Icon></div>
                    <label>{f.text || f.field.text}</label>
                    <div className={'sy-dg-table-head-th-property'} ><Icon icon='elipsis:sy'></Icon></div>
                </div>
            })}
            <div className='sy-dg-table-head-th sy-dg-table-head-th-plus'
                style={{ width: 40 }} onClick={e => this.block.onAddField(e)}>
                <Icon icon={Plus}></Icon>
            </div>
        </div>
    }
    renderBody() {
        if (this.block.data && this.block.isLoadData) {
            return <div className='sy-dg-table-body'>
                <ChildsArea childs={this.block.childs}></ChildsArea>
            </div>
        }
        else return <div><Loading></Loading></div>
    }
    renderCreateTable() {
        return !this.block.schema && <div>
            <a onClick={e => this.block.didMounted()}>创建表格</a>
        </div>
    }
    render() {
        var self = this;
        return <div className="sy-dg-table">
            {this.block.schema && <>
                {this.renderHead()}
                {this.renderBody()}
                <div onMouseDown={e => self.block.onAddRow({}, undefined, 'after')} className="sy-dg-table-add" style={{ width: this.block.fields.sum(s => s.colWidth) + 40 }}>
                    <Icon size={12} icon={Plus}></Icon><span>新增</span>
                </div>
            </>}
            {this.renderCreateTable()}
        </div>
    }
}