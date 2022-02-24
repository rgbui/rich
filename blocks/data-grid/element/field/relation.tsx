import React from "react";
import { PlusSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { useRelationPickData } from "../../../../extensions/tablestore/relation.picker";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { FieldType } from "../../schema/type";
import { OriginField } from "./origin.field";

@url('/field/relation')
export class FieldRelation extends OriginField {
    get relationList() {
        var rs: any[] = [];
        var vs: string[] = this.value;
        if (!Array.isArray(vs)) vs = [];
        if (vs.length == 0) return [];
        var g = this.dataGrid.relationDatas.get(this.field.config?.relationTableId);
        if (Array.isArray(g)) {
            return g.findAll(g => vs.includes(g.id))
        }
        return rs;
    }
    get relationSchema() {
        return this.dataGrid.relationSchemas.find(g => g.id == this.field.config?.relationTableId)
    }
}
@view('/field/relation')
export class FieldRelationView extends BlockView<FieldRelation>{
    async onPickRelationData(event: React.MouseEvent) {
        var r = await useRelationPickData({ roundArea: Rect.fromEvent(event) }, {
            field: this.block.viewField.field,
            relationDatas: this.block.relationList,
            isMultiple: this.block.viewField.field.config.isMultiple,
            relationSchema: this.block.relationSchema
        });
        if (r) {
            var rs = this.block.dataGrid.relationDatas.get(this.block.relationSchema.id);
            if (!Array.isArray(rs)) {
                rs = [];
                this.block.dataGrid.relationDatas.set(this.block.relationSchema.id, rs)
            }
            r.each(g => {
                if (!rs.some(c => c.id == g.id)) rs.push(g)
            });
            var ids = r.map(r => r.id);
            this.block.value = ids;
            await this.block.onUpdateCellValue(ids);
            this.forceUpdate();
        }
    }
    renderList() {
        var rs = this.block.relationSchema;
        var f = rs?.fields?.find(g => g.type == FieldType.title);
        if (!f) f = rs?.fields.find(g => g.type == FieldType.text);
        return <div className='sy-field-relation-items'>{this.block.relationList?.map(r => {
            return <a key={r.id}>{r[f?.name]}</a>
        })}
            <Icon click={e => this.onPickRelationData(e)} icon={PlusSvg}></Icon>
        </div>
    }
    render() {
        return <div className='sy-field-relation'>
            {this.renderList()}
        </div>
    }
}